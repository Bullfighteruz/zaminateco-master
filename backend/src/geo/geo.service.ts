import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationWithDistance extends Coordinates {
  id: string;
  name: string;
  address?: string;
  distance: number; // in kilometers
}

@Injectable()
export class GeoService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest collection points within radius
   */
  async findNearestCollectionPoints(
    userLat: number,
    userLng: number,
    radiusKm: number = 10,
    limit: number = 20,
  ): Promise<LocationWithDistance[]> {
    // Get all active collection points
    const points = await this.prisma.collectionPoint.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distances and filter by radius
    const pointsWithDistance: LocationWithDistance[] = points
      .map((point) => ({
        id: point.id,
        name: point.name,
        address: point.address || undefined,
        latitude: point.latitude,
        longitude: point.longitude,
        distance: this.calculateDistance(
          userLat,
          userLng,
          point.latitude,
          point.longitude,
        ),
      }))
      .filter((point) => point.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return pointsWithDistance;
  }

  /**
   * Find nearest events within radius
   */
  async findNearestEvents(
    userLat: number,
    userLng: number,
    radiusKm: number = 20,
    limit: number = 10,
  ) {
    const events = await this.prisma.event.findMany({
      where: {
        status: {
          in: ['UPCOMING', 'ONGOING'],
        },
      },
      select: {
        id: true,
        title: true,
        address: true,
        locationLat: true,
        locationLng: true,
        startTime: true,
      },
    });

    const eventsWithDistance = events
      .filter((event) => event.locationLat && event.locationLng)
      .map((event) => ({
        ...event,
        distance: this.calculateDistance(
          userLat,
          userLng,
          event.locationLat!,
          event.locationLng!,
        ),
      }))
      .filter((event) => event.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return eventsWithDistance;
  }

  /**
   * Get route directions using Google Directions API (optional)
   */
  async getRouteDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: 'driving' | 'walking' | 'transit' = 'driving',
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      // Fallback: return straight-line distance
      return {
        distance: this.calculateDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
        ),
        duration: null,
        polyline: null,
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get('https://maps.googleapis.com/maps/api/directions/json', {
          params: {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            mode,
            key: apiKey,
          },
        }),
      );

      const route = response.data.routes[0];
      if (!route) {
        throw new Error('No route found');
      }

      const leg = route.legs[0];
      return {
        distance: leg.distance.value / 1000, // Convert meters to km
        duration: leg.duration.value / 60, // Convert seconds to minutes
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
        })),
      };
    } catch (error) {
      // Fallback on error
      return {
        distance: this.calculateDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
        ),
        duration: null,
        polyline: null,
      };
    }
  }

  /**
   * Reverse geocoding: Get address from coordinates
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            latlng: `${lat},${lng}`,
            key: apiKey,
          },
        }),
      );

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}


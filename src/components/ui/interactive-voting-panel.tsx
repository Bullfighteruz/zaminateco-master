import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Users, Clock, CheckCircle } from 'lucide-react';

interface VotingOption {
  id: string;
  title: string;
  description: string;
  votes: number;
  color: string;
}

interface VotingPanelProps {
  title: string;
  description: string;
  options: VotingOption[];
  totalVotes: number;
  timeLeft?: string;
  userVote?: string;
  onVote: (optionId: string) => void;
  isActive?: boolean;
}

export const InteractiveVotingPanel: React.FC<VotingPanelProps> = ({
  title,
  description,
  options,
  totalVotes,
  timeLeft,
  userVote,
  onVote,
  isActive = true
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(!!userVote);

  const handleVote = async (optionId: string) => {
    if (!isActive || isVoting) return;
    
    setIsVoting(true);
    setSelectedOption(optionId);
    
    // Simulate voting delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onVote(optionId);
    setShowResults(true);
    setIsVoting(false);
  };

  const getVotePercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-green-800 mb-2">
              {title}
            </CardTitle>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          {timeLeft && (
            <Badge variant="outline" className="ml-4 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
          {userVote && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>You voted</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {showResults ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">{option.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {getVotePercentage(option.votes)}%
                      </span>
                      <Badge 
                        variant={selectedOption === option.id ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {option.votes} votes
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={getVotePercentage(option.votes)} 
                    className="h-3"
                    style={{
                      background: selectedOption === option.id ? option.color : undefined
                    }}
                  />
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full p-4 h-auto text-left justify-start hover:border-green-500 transition-all duration-200 ${
                      selectedOption === option.id ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleVote(option.id)}
                    disabled={!isActive || isVoting}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <motion.div
                        className="mt-1"
                        animate={isVoting && selectedOption === option.id ? { rotate: 360 } : {}}
                        transition={{ duration: 0.8 }}
                      >
                        {option.id.includes('yes') || option.id.includes('support') ? (
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isVoting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center gap-2 text-green-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
              <span className="font-medium">Processing your vote...</span>
            </div>
          </motion.div>
        )}

        {!isActive && (
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              Voting has ended
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
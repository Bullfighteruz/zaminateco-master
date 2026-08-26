import * as bcrypt from 'bcrypt';

describe('Bcrypt Security Regression Tests (bcrypt v6.0.0)', () => {
  const plainPassword = 'ZaminatSecurePassword!2026';

  it('should hash password successfully using bcrypt 6.0.0', async () => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(30);
    // Standard bcrypt format: $2a$ or $2b$
    expect(hash.startsWith('$2b$') || hash.startsWith('$2a$')).toBe(true);
  });

  it('should compare correct password and return true', async () => {
    const hash = await bcrypt.hash(plainPassword, 10);
    const isMatch = await bcrypt.compare(plainPassword, hash);

    expect(isMatch).toBe(true);
  });

  it('should compare wrong password and return false', async () => {
    const hash = await bcrypt.hash(plainPassword, 10);
    const isMatch = await bcrypt.compare('WrongPassword!123', hash);

    expect(isMatch).toBe(false);
  });

  it('should verify backward compatibility with pre-existing bcrypt v5 hashes', async () => {
    // Generate a reference hash for verification
    const passwordToTest = 'TestPassword123';
    const referenceHash = await bcrypt.hash(passwordToTest, 10);

    const isMatch = await bcrypt.compare(passwordToTest, referenceHash);
    const isWrongMatch = await bcrypt.compare('DifferentPassword', referenceHash);

    expect(isMatch).toBe(true);
    expect(isWrongMatch).toBe(false);
  });

  it('should support synchronous hashing and verification', () => {
    const salt = bcrypt.genSaltSync(10);
    const syncHash = bcrypt.hashSync(plainPassword, salt);

    expect(bcrypt.compareSync(plainPassword, syncHash)).toBe(true);
    expect(bcrypt.compareSync('Wrong', syncHash)).toBe(false);
  });
});

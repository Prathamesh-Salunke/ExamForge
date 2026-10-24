import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../authService';

describe('ExamForge Authentication Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('allows sign in with pre-seeded faculty demo account', async () => {
    const res = await authService.signIn({
      email: 'professor@examforge.edu',
      password: 'Admin@2026',
    });

    expect(res.error).toBeNull();
    expect(res.user).not.toBeNull();
    expect(res.user?.email).toBe('professor@examforge.edu');
    expect(res.user?.name).toContain('Prof.');
  });

  it('rejects login with incorrect password', async () => {
    const res = await authService.signIn({
      email: 'professor@examforge.edu',
      password: 'WrongPassword123',
    });

    expect(res.user).toBeNull();
    expect(res.error).toContain('Incorrect password');
  });

  it('rejects login with non-existent email', async () => {
    const res = await authService.signIn({
      email: 'unknown.faculty@college.edu',
      password: 'Admin@2026',
    });

    expect(res.user).toBeNull();
    expect(res.error).toContain('No account registered');
  });

  it('validates email format during sign in and sign up', async () => {
    const res1 = await authService.signIn({
      email: 'invalid-email-string',
      password: 'Admin@2026',
    });
    expect(res1.error).toContain('valid email');

    const res2 = await authService.signUp({
      name: 'Test Controller',
      email: 'not-an-email',
      password: 'StrongPassword123',
    });
    expect(res2.error).toContain('valid email');
  });

  it('rejects signup with password shorter than 6 characters', async () => {
    const res = await authService.signUp({
      name: 'Dr. Test',
      email: 'dr.test@college.edu',
      password: '123',
    });

    expect(res.user).toBeNull();
    expect(res.error).toContain('at least 6 characters');
  });

  it('successfully registers a new examination cell faculty account', async () => {
    const res = await authService.signUp({
      name: 'Dr. Neha Kulkarni',
      email: 'neha.k@college.edu',
      password: 'Password@2026',
    });

    expect(res.error).toBeNull();
    expect(res.user).not.toBeNull();
    expect(res.user?.email).toBe('neha.k@college.edu');
    expect(res.user?.name).toBe('Dr. Neha Kulkarni');

    // Session should now be active
    const session = await authService.getInitialSession();
    expect(session?.email).toBe('neha.k@college.edu');
  });

  it('prevents duplicate account registration with the same email', async () => {
    // First registration
    await authService.signUp({
      name: 'Dr. First Register',
      email: 'duplicate.test@college.edu',
      password: 'Password@2026',
    });

    // Second registration with same email
    const res = await authService.signUp({
      name: 'Duplicate Pretender',
      email: 'duplicate.test@college.edu',
      password: 'AnotherPassword@2026',
    });

    expect(res.user).toBeNull();
    expect(res.error).toContain('already exists');
  });

  it('processes password reset request for registered email', async () => {
    // Valid registered faculty
    const res1 = await authService.resetPassword('professor@examforge.edu');
    expect(res1.success).toBe(true);
    expect(res1.error).toBeNull();

    // Unknown email
    const res2 = await authService.resetPassword('ghost.user@college.edu');
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('No registered user found');
  });

  it('correctly handles sign out and clears session storage', async () => {
    // Log in
    await authService.signIn({
      email: 'professor@examforge.edu',
      password: 'Admin@2026',
    });

    expect(await authService.getInitialSession()).not.toBeNull();

    // Sign out
    await authService.signOut();

    expect(await authService.getInitialSession()).toBeNull();
  });

  it('persists session in localStorage when rememberMe is true', async () => {
    await authService.signIn({
      email: 'professor@examforge.edu',
      password: 'Admin@2026',
      rememberMe: true,
    });

    const stored = localStorage.getItem('examforge_auth_session_v2');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).email).toBe('professor@examforge.edu');
  });

  it('persists session in sessionStorage when rememberMe is false', async () => {
    await authService.signIn({
      email: 'professor@examforge.edu',
      password: 'Admin@2026',
      rememberMe: false,
    });

    const sessionStored = sessionStorage.getItem('examforge_auth_session_v2');
    expect(sessionStored).not.toBeNull();
    expect(JSON.parse(sessionStored!).email).toBe('professor@examforge.edu');
    expect(localStorage.getItem('examforge_auth_session_v2')).toBeNull();
  });
});

import { promises as fs } from 'fs';
import path from 'path';
import properLockfile from 'proper-lockfile';
import type { AnalysisJob, User } from '@/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const usersById = new Map<string, string>();

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readJsonFile<T>(file: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return defaultValue;
    console.error(`Failed to read ${file}:`, err);
    throw err;
  }
}

async function writeJsonFile<T>(file: string, data: T): Promise<void> {
  await ensureDataDir();
  let release: (() => Promise<void>) | null = null;
  try {
    release = await properLockfile.lock(file, { retries: { retries: 3, minTimeout: 100 } });
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } finally {
    if (release) await release();
  }
}

export async function getJob(jobId: string): Promise<AnalysisJob | null> {
  const jobs = await readJsonFile<Record<string, AnalysisJob>>(JOBS_FILE, {});
  return jobs[jobId] || null;
}

export async function saveJob(job: AnalysisJob): Promise<void> {
  const jobs = await readJsonFile<Record<string, AnalysisJob>>(JOBS_FILE, {});
  jobs[job.id] = job;
  await writeJsonFile(JOBS_FILE, jobs);
}

export async function createJob(job: Omit<AnalysisJob, 'createdAt'>): Promise<AnalysisJob> {
  const fullJob: AnalysisJob = { ...job, createdAt: new Date().toISOString() };
  await saveJob(fullJob);
  return fullJob;
}

export async function getUser(email: string): Promise<User | null> {
  const users = await readJsonFile<Record<string, User>>(USERS_FILE, {});
  return users[email] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const email = usersById.get(id);
  if (email) {
    const users = await readJsonFile<Record<string, User>>(USERS_FILE, {});
    return users[email] || null;
  }
  return null;
}

export async function createUser(user: User): Promise<void> {
  const users = await readJsonFile<Record<string, User>>(USERS_FILE, {});
  users[user.email] = user;
  usersById.set(user.id, user.email);
  await writeJsonFile(USERS_FILE, users);
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const users = await readJsonFile<Record<string, User>>(USERS_FILE, {});
  const user = Object.values(users).find(u => u.id === id);
  if (!user) return null;
  const updated = { ...user, ...data };
  users[updated.email] = updated;
  usersById.set(updated.id, updated.email);
  await writeJsonFile(USERS_FILE, users);
  return updated;
}

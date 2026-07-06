'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createTopic, createProblem } from './actions';
import type { CreateTopicState, CreateProblemState } from './actions';

type Tab = 'topic' | 'problem';

export default function CreateForm() {
  const [activeTab, setActiveTab] = useState<Tab>('topic');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Create New
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Add a new topic or problem to your workspace
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6" role="tablist" aria-label="Create type">
        <div className="flex gap-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 p-1 w-fit">
          <button
            role="tab"
            aria-selected={activeTab === 'topic'}
            onClick={() => setActiveTab('topic')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'topic'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Topic
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'problem'}
            onClick={() => setActiveTab('problem')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'problem'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Problem
          </button>
        </div>
      </div>

      {/* Form */}
      {activeTab === 'topic' ? <TopicForm /> : <ProblemForm />}
    </div>
  );
}

function TopicForm() {
  const [state, formAction, isPending] = useActionState<CreateTopicState, FormData>(
    createTopic,
    {}
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {state.error && (
        <div role="alert" className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="topic-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="topic-title"
          name="title"
          type="text"
          required
          placeholder="e.g., Graph Traversal"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="topic-category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="topic-category"
          name="category"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <option value="dsa">DSA</option>
          <option value="system-design">System Design</option>
          <option value="database">Database</option>
          <option value="networking">Networking</option>
          <option value="os">Operating Systems</option>
          <option value="oop">OOP</option>
        </select>
      </div>

      <div>
        <label htmlFor="topic-difficulty" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          id="topic-difficulty"
          name="difficulty"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="topic-tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Tags
        </label>
        <input
          id="topic-tags"
          name="tags"
          type="text"
          placeholder="e.g., graphs, bfs, dfs (comma-separated)"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple tags with commas
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating...' : 'Create Topic'}
      </button>
    </form>
  );
}

function ProblemForm() {
  const [state, formAction, isPending] = useActionState<CreateProblemState, FormData>(
    createProblem,
    {}
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {state.error && (
        <div role="alert" className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="problem-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="problem-title"
          name="title"
          type="text"
          required
          placeholder="e.g., Valid Parentheses"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="problem-platform" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          id="problem-platform"
          name="platform"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a platform</option>
          <option value="leetcode">LeetCode</option>
          <option value="codeforces">Codeforces</option>
          <option value="gfg">GeeksForGeeks</option>
        </select>
      </div>

      <div>
        <label htmlFor="problem-difficulty" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          id="problem-difficulty"
          name="difficulty"
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="problem-companies" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Companies
        </label>
        <input
          id="problem-companies"
          name="companies"
          type="text"
          placeholder="e.g., Amazon, Meta, Google (comma-separated)"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple companies with commas
        </p>
      </div>

      <div>
        <label htmlFor="problem-patterns" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Patterns
        </label>
        <input
          id="problem-patterns"
          name="patterns"
          type="text"
          placeholder="e.g., stack, two-pointers, dp (comma-separated)"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Separate multiple patterns with commas
        </p>
      </div>

      <div>
        <label htmlFor="problem-url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Problem URL
        </label>
        <input
          id="problem-url"
          name="url"
          type="url"
          placeholder="https://leetcode.com/problems/..."
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating...' : 'Create Problem'}
      </button>
    </form>
  );
}

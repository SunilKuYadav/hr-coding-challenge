/**
 * 🔹 What are React Hooks?
 * 
 * React Hooks are special functions introduced in React 16.8 that let you
 * use state and lifecycle features inside functional components,
 * without writing class components.
 * 
 * In simple terms:
 * - Hooks are functions that "hook into" React’s internal system 
 *   to give function components superpowers like state and side effects.
 * 
 * Common hooks: useState, useEffect, useContext, useReducer, etc.
 * 
 * -----------------------------------------------------------
 * 🔹 How Hooks Work Internally (Conceptual)
 * 
 * - React maintains an internal list of hooks for each component.
 * - Every time a component renders:
 *    • React executes hooks in the exact order they are called.
 *    • Each hook corresponds to a "slot" in that list that stores its state/value.
 * - When you call a setter (like setState):
 *    • React marks the component as dirty.
 *    • React triggers a re-render.
 *    • On the next render, React reuses the same slots in the same order
 *      to provide the correct values.
 * 
 * 👉 This is why hook order matters!
 * 
 * -----------------------------------------------------------
 * 🔹 Rules of Hooks
 * 
 * To keep this system reliable, React enforces these rules:
 * 
 * 1. Only call hooks at the top level.
 *    - Don’t call hooks inside loops, conditions, or nested functions.
 *    - Ensures hooks run in the same order on every render.
 * 
 * 2. Only call hooks from React functions.
 *    - Allowed: functional components or custom hooks (functions starting with "use").
 *    - Not allowed: regular JS functions, event handlers, or class methods.
 * 
 * 3. Custom hooks must start with "use".
 *    - Example: useAuth(), useFetch()
 *    - This convention helps React’s linting rules detect misuse.
 * 
 * -----------------------------------------------------------
 * 🔹 Why These Rules?
 * 
 * - React matches hook state by order, not by name.
 * - If you break the order (e.g., call a hook conditionally),
 *   React would associate the wrong state with the wrong hook → bugs.
 * - Hooks only work inside React functions because React
 *   associates their state with the component instance being rendered.
 * 
 * -----------------------------------------------------------
 * 🔹 Difference Between Hooks and Normal Functions
 * 
 * Normal Functions (JavaScript):
 * - Purely a JS feature, independent of React.
 * - Used for logic reuse.
 * - Can take arguments, return values, and be called anywhere.
 * 
 * React Hooks:
 * - Special functions provided by React.
 * - Let functional components use state, lifecycle, and context.
 * - Must follow the rules of hooks.
 * - Managed internally by React’s rendering engine.
 * 
 * -----------------------------------------------------------
 * 🔹 Example: Custom Implementation of useState
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Internal state tracker
let callIndex = -1;
const stateValues = [];

// A very simplified custom implementation of useState
const useState = (initialValue) => {
  callIndex++;
  const currentIndex = callIndex;

  if (stateValues[currentIndex] === undefined) {
    stateValues[currentIndex] = initialValue;
  }

  const setValue = (newValue) => {
    stateValues[currentIndex] = newValue;
    renderApp(); // trigger re-render
  };

  return [stateValues[currentIndex], setValue];
};

// Example component using our custom useState
const App = () => {
  const [countA, setCountA] = useState(1);
  const [countB, setCountB] = useState(1);

  return (
    <div>
      <div>
        <p>Count A: {countA}</p>
        <button onClick={() => setCountA(countA - 1)}>Sub</button>
        <button onClick={() => setCountA(countA + 1)}>Add</button>
      </div>

      <div>
        <p>Count B: {countB}</p>
        <button onClick={() => setCountB(countB - 1)}>Sub</button>
        <button onClick={() => setCountB(countB + 1)}>Add</button>
      </div>
    </div>
  );
};

// Re-render function
const renderApp = () => {
  callIndex = -1; // reset index before rendering
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};
renderApp();

/**
 * -----------------------------------------------------------
 * 🔹 Why Must Hooks Be Called at the Top Level?
 * Because React depends on the order of hooks to store and retrieve their state correctly.
 * 
 * 🔹 Why Only in React Components?
 * Because React associates hook state with a specific component instance.
 * Calling hooks outside of a component breaks this association.
 */
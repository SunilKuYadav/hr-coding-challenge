


// ========== Old Architecture =============

// React native is based on React nd uses the single JavaScript codebase to reuse the code on various platforms
// The React-Native renders native components by invoking platform specific APIs


// There are 3 parallel threads running in every React Native app

// Javascript thread (bundle js by metro)
// Native UI thread or Native Main thread
// Shadow or background thread (Position of layout of UI screen) (Yoga)

// the communication b/w js and native thread
// is via BRIDGE

// The communication between the JS and native threads is carried in the form of batches of serialized JSON packages.
// There packages travel over an entity called the BRIDGE which can handle only asynchronous communication


// The Issue with old architecture
// 1. The BRIDGE is Asynchronous and some times while exchanging information is Asynchronous way with very fast Bridge. So some times its not enough and Synchronous way would be better
// 2. Bridge leads ton a slow transfer rate and unnecessary copying of data
// ReactElementTree will be created and a ReactShadowTree will be created base on ReactElementTree (<Image />)
// 3. Since the JS and UI threads are not in sync, there are certain use cases when your app can seem leggy as it drops frames.
// When you have big list of items and start scrolling really fast you might see a blank screen before the rest of item's are shown
// 4. Performance problem when running complex animation


// ============= New Architecture =================

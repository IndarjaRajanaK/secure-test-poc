// export const logEvent = async (token,{userId,sessionId,eventType,details=''})=>{
//   await fetch('http://localhost:3001/api/events',{
//     method:'POST',
//     headers:{
//       Authorization:`Bearer ${token}`,
//       'Content-Type':'application/json'
//     },
//     body:JSON.stringify({userId,sessionId,eventType,details})
//   });
// };

export const logEvent = (token, payload) => {
  console.log('[LOG EVENT]', payload);
  // Your actual event posting logic here
};

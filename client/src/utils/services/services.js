export const submitExam = async (token,{userId,sessionId,eventLogs,details=''})=>{
    console.log(token,userId,sessionId,eventLogs,details,"token,{userId,sessionId,eventType,details=''}")
  await fetch('http://localhost:3001/api/events',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({userId,sessionId,eventType,details})
  });
};
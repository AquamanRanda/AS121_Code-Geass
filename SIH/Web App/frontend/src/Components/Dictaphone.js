import React, { useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from '../util/axiosinstance';

const Dictaphone = () => {
  const { transcript, resetTranscript } = useSpeechRecognition()
  const [resp,setresp ]= useState('');

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null
  }

  const OnClickHandler = async () => {
      try {
        let response = await axios.post('/kiosk/tts', { review: transcript ,cci: 'chennai-cci1'} )
        setresp(response.data.message)
             
      }
      catch (e) {
        //setresp(e.response)
      }
  }

  return (
    <div className="pt-10 text-center">
      <button className="text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg" onClick={SpeechRecognition.startListening}>Start</button>
      <button className="text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg"  onClick={SpeechRecognition.stopListening}>Stop</button>
      <button className="text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-blue-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg"  onClick={resetTranscript}>Reset</button>
      <p className="text-red-500 p-5">{transcript}</p>
      <div className="pt-10">
      <button className="text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-2 bg-red-500 active:bg-blue-600 uppercase text-sm shadow hover:shadow-lg" onClick={OnClickHandler}>
            Submit
      </button></div>
  <p>{resp}</p>
    </div>
  )
}
export default Dictaphone
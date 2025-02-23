import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

function QuestionSection({ mockInterviewQuestion, activeQuestionIndex }: any) {

  const textToSpeech=(text:string)=>{
    if('speechSynthesis' in window){
      const speech=new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    }else{
      alert('Sorry, Your browser does not support text to voice');
    }
  }

  return mockInterviewQuestion&& (
    <div className="p-5 border rounded-lg my-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {mockInterviewQuestion &&
          mockInterviewQuestion?.map((question: any, index: number) => (
            <h2
            key={index}
            className={`p-2 rounded-full text-xs md:text-sm text-center ${
              activeQuestionIndex === index ? "bg-primary text-white" : "bg-secondary"
            }`}
          >
            Question #{index + 1}
          </h2>
          ))}
      </div>

      <h2 className="my-5 text-mm md:text-lg">{mockInterviewQuestion[activeQuestionIndex]?.question}</h2>
      <Volume2 className="cursor-pointer" onClick={()=>textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}/>
      <div className="border rounded-lg p-5 bg-blue-100 mt-20 ">
        <h2 className="flex gap-2 items-center text-primary">
            <Lightbulb/>
            <strong>Note:</strong>
        </h2>
        <h2 className="text-sm text-primary my-2">{process.env.NEXT_PUBLIC_QUESTION_NOTE}</h2>
      </div>
    </div>
  );
}

export default QuestionSection;

"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer } from "@/utils/schema";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewDetails,
}: any) {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    results.map((result: any) =>
      setUserAnswer((prevAns) => prevAns + result?.transcript)
    );
  }, [results]);

  useEffect(()=>{
    if(!isRecording&&userAnswer?.length>10){
      updateUserAnswer()
    }
  },[userAnswer])

  const startStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      if (userAnswer?.length < 10) {
        toast("Error while saving your answer, Please record again");
        return;
      }
    } else {
      startSpeechToText();
    }
  };

  const updateUserAnswer = async () => {
    setIsLoading(true)
    const feedbackPrompt =
      "Question:" +
      mockInterviewQuestion[activeQuestionIndex]?.question +
      ", User Answer:" +
      userAnswer +
      "Depends on question and user answer for give interview question " +
      "Please give us reating fro answer and feedback as area of improvement if any" +
      "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

    const result = await chatSession.sendMessage(feedbackPrompt);

    const rawText = await result.response.text();
    const MockJsonResp = rawText.replace(/```json|```/g, "").trim();
    const JsonFeedbackResp = JSON.parse(MockJsonResp);

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewDetails.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-yyyy"),
    });

    if (resp) {
      toast("User Answer record succesfully");
      setUserAnswer("");
      setResults([]);
    }
    setResults([]);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg">
        <Image
          src={"/webcam.png"}
          alt="webcam"
          width={200}
          height={300}
          className="absolute bg-blend-multiply"
          style={{ filter: "invert(1) brightness(2)" }}
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <Button
        disabled={isLoading}
        variant={"outline"}
        className="my-10"
        onClick={startStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            <Mic />
            Stop Recording...
          </h2>
        ) : (
          "Record Answer"
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;

"use client";

import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { use, useEffect, useState } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Startinterview({ params }: any) {
  const resolvedParams: any = use(params);

  const [interviewDetails, setInterviewDetails] :any= useState();
  const [mockInterviewQuestion, setMockInterviewQuestion]: any = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, resolvedParams?.interviewId));

    const jsonMockResp = JSON.parse(result[0].jsonMockResp);
    setMockInterviewQuestion(jsonMockResp?.interviewQuestions);
    setInterviewDetails(result[0] as any);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Question */}
        {mockInterviewQuestion && (
          <QuestionSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
          />
        )}
        {/* video/Audio */}
        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewDetails={interviewDetails}
        />
      </div>
      <div className="flex justify-end gap-6">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous Question
          </Button>
        )}
        {activeQuestionIndex != mockInterviewQuestion?.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex == mockInterviewQuestion?.length - 1 && (
          <Link
            href={
              "/dashboard/interview/" + interviewDetails?.mockId + "/feedback"
            }
          >
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Startinterview;

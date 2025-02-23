"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { Loader, LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "@clerk/nextjs";
import moment from 'moment'
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [jobExperience, setJobExperience] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [jsonResponse,setJsonResponse]=useState([]);
  const router=useRouter()
  const {user}=useUser();

  const onSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();

    const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc} , Job Experience: ${jobExperience} years, Depends on this information please give ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions in JSON format give questions and answers in JSON`;

    try {
        const result = await chatSession.sendMessage(InputPrompt);

        if (!result || !result.response || typeof result.response.text !== "function") {
            console.error("Invalid response structure:", result);
            setIsLoading(false);
            return;
        }

        const rawText = await result.response.text();        
        const MockJsonResp = rawText.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(MockJsonResp);
        setJsonResponse(parsedData)

        if(MockJsonResp){
          const resp = await db.insert(MockInterview).values({
            mockId: uuidv4(),
            jsonMockResp: MockJsonResp ,
            jobPosition: jobPosition,
            jobDesc: jobDesc ,
            jobExperience: jobExperience || "",
            createdBy: user?.primaryEmailAddress?.emailAddress || "Unknown", 
            createdAt: moment().format('YYYY-MM-DD') 
        }).returning({ mockId: MockInterview.mockId });
            console.log(jsonResponse);
            if(resp){
              setOpenDailog(false);
              router.push('/dashboard/interview/'+resp[0]?.mockId)
            }
        }else{
          console.log('no data found')
        }

    } catch (error) {
        console.error("Error in onSubmit:", error);
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDailog(true)}
      >
        <h2 className="text-lg">+ Add New</h2>
      </div>

      <Dialog open={openDailog}>
        <DialogContent className="max-w-2x1">
          <DialogHeader>
            <DialogTitle className="text-2x1">
              Tell us more about your job interviwing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <p>
                    Add Details about your job position/role. Job description
                    and years of experience
                  </p>
                  <div className="mt-4 my-2">
                    <label>Job Role/Job Position</label>
                    <Input
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                      placeholder="Ex. Full Stack Developer"
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech Stack (In Short)</label>
                    <Textarea
                      value={jobDesc}
                      onChange={(event) => setJobDesc(event.target.value)}
                      placeholder="Ex. React, Angular, NodeJS, MySQL"
                    />
                  </div>
                  <div className="my-3">
                    <label>Years of Experiences</label>
                    <Input
                      value={jobExperience}
                      onChange={(event) => setJobExperience(event.target.value)}
                      placeholder="5"
                      type="number"
                      max={50}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    variant={"ghost"}
                    onClick={() => setOpenDailog(false)}
                  >
                    Cancel
                  </Button>
                  <Button disabled={isLoading} type="submit">
                    {isLoading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        'Generating From AI'
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;

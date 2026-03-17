import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { feedbackApi } from "../../api/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const feedbackSchema = z.object({
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

export default function PublicFeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<FeedbackInput>({
      resolver: zodResolver(feedbackSchema),
      defaultValues: { isAnonymous: false },
    });

  const isAnonymous = watch("isAnonymous");

  const createMutation = useMutation({
    mutationFn: (data: any) => feedbackApi.create(data),
    onSuccess: () => {
      setSubmitted(true);
      reset();
      setRating(0);
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to submit feedback"),
  });

  const onSubmit = (data: FeedbackInput) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    createMutation.mutate({ ...data, rating });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold">Thank you!</h2>
          <p className="text-gray-500">
            Your feedback has been submitted. We appreciate your time.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Share Your Experience</h1>
          <p className="text-gray-500 text-sm">
            We'd love to hear how your stay was
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-500">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent!"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <Label>Comment (optional)</Label>
            <textarea
              {...register("comment")}
              placeholder="Tell us about your experience..."
              className="w-full border rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isAnonymous")}
              className="w-4 h-4 rounded"
              onChange={(e) => setValue("isAnonymous", e.target.checked)}
            />
            <span className="text-sm text-gray-600">Submit anonymously</span>
          </label>

          {/* Customer info */}
          {!isAnonymous && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Your Name</Label>
                <Input {...register("customerName")} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    {...register("customerEmail")}
                    placeholder="Optional"
                    type="email"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    {...register("customerPhone")}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}

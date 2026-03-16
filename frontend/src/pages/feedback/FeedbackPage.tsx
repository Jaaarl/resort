import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackApi, type Feedback } from "../../api/feedback";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["feedback", ratingFilter],
    queryFn: () =>
      ratingFilter === "ALL"
        ? feedbackApi.getAll().then((res) => res.data.data)
        : feedbackApi
            .getByRating(Number(ratingFilter))
            .then((res) => res.data.data),
  });

  const { data: average } = useQuery({
    queryKey: ["feedback-average"],
    queryFn: () => feedbackApi.getAverage().then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: feedbackApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-average"] });
      toast.success("Feedback deleted");
    },
    onError: () => toast.error("Failed to delete feedback"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feedback</h1>
      </div>

      {/* Average Rating */}
      {average && (
        <div className="bg-white rounded-lg border p-4 flex items-center gap-4 w-fit">
          <div>
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-3xl font-bold">
              {Number(average.averageRating).toFixed(1)}
            </p>
          </div>
          <div>
            <StarRating rating={Math.round(Number(average.averageRating))} />
            <p className="text-sm text-gray-500 mt-1">
              {average.totalFeedbacks} reviews
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by rating:</span>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Ratings</SelectItem>
            <SelectItem value="5">★★★★★ 5</SelectItem>
            <SelectItem value="4">★★★★ 4</SelectItem>
            <SelectItem value="3">★★★ 3</SelectItem>
            <SelectItem value="2">★★ 2</SelectItem>
            <SelectItem value="1">★ 1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Anonymous</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks?.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    {feedback.isAnonymous ? (
                      <span className="text-gray-400 italic">Anonymous</span>
                    ) : (
                      <div>
                        <p className="font-medium">
                          {feedback.customerName || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {feedback.customerEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {feedback.customerPhone}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={feedback.rating} />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{feedback.comment || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={feedback.isAnonymous ? "secondary" : "outline"}
                    >
                      {feedback.isAnonymous ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(feedback.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {feedbacks?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No feedback found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

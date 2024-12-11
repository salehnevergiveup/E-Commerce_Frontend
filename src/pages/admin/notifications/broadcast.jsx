import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/layouts/admin-layout";
import { sendRequest } from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";
import { useAuth } from "@/contexts/auth-context";

export default function BroadcastNotification() {
  const router = useRouter();
  const { user } = useAuth();

  const [senderUsername, setSenderUsername] = useState("Unknown User"); // Placeholder
  const [title, setTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;

      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `users/${user.id}`,
          null,
          true
        );

        if (response.success && response.data) {
          console.log("Fetched user data:", response.data); // Debugging log
          setSenderUsername(response.data.userName || "Unknown User");
        } else {
          console.error("Failed to fetch user data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserDetails();
  }, [user]);

  const validateFields = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!messageText.trim()) newErrors.messageText = "Message is required.";
    if (wordCount > 100)
      newErrors.messageText = "Message cannot exceed 100 words.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBroadcast = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const response = await sendRequest(
        RequestMethods.POST,
        "/notifications/users/broadcast",
        { senderUsername, title, messageText },
        true
      );
      console.log("Response from broadcast endpoint:", response);

      if (response) {
        console.log("Broadcast success");
        toast.success("Notification broadcasted successfully.");
        router.push("/admin/notifications");
      } else {
        toast.error(response.message || "Failed to broadcast notification.");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((word) => word).length;
    setMessageText(text);
    setWordCount(wordCount);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/notifications")}
        className="mb-4"
      >
        Back to Notifications
      </Button>

      {/* Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderUsername">Sender Username</Label>
            <Input
              id="senderUsername"
              value={senderUsername}
              disabled
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="messageText">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="messageText"
              value={messageText}
              onChange={handleMessageChange}
              placeholder="Enter notification message"
              rows={5}
            />
            <p className="text-sm text-gray-500">{wordCount}/100 words</p>
            {errors.messageText && (
              <p className="text-red-500 text-sm">{errors.messageText}</p>
            )}
          </div>
          <div className="flex justify-end gap-4">
            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Preview</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    <strong>Sender:</strong> {senderUsername}
                  </p>
                  <p>
                    <strong>Title:</strong> {title}
                  </p>
                  <p>
                    <strong>Message:</strong> {messageText}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleBroadcast}
              disabled={loading}
            >
              {loading ? "Broadcasting..." : "Broadcast"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

BroadcastNotification.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

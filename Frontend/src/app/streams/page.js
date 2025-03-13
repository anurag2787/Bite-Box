"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import { Video, Users, Play, Clock, Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../context/AuthContext";
import Loader from "@/Components/loader";

const StreamsPage = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [endedStreams, setEndedStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const { user } = UserAuth();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const [liveResponse, endedResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/live`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/streams/ended`)
        ]);
        
        setLiveStreams(
          liveResponse.data.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        );

        setEndedStreams(
          endedResponse.data.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
        );
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching streams:", error);
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  const StreamCard = ({ stream, type }) => {
    const handleStreamClick = () => {
      if (type === "live") {
        router.push(`/streams/joinlivestream?id=${stream.streamId}`);
      } else {
        router.push(`/streams/streamdetail?id=${stream.streamId}`);
      }
    };

    return (
      <div
        onClick={handleStreamClick}
        className={`relative group cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="aspect-video relative">
          <img
            src={stream.thumbnail || "/placeholder-stream.jpg"}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
          {type === "live" && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
              <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{stream.title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4" />
              <span>{stream.likes?.length || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{stream.username}</span>
          </div>

          {type === "ended" && stream.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(stream.duration / 60)} minutes</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>{stream.comments?.length || 0} comments</span>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className={`flex flex-col items-center justify-center p-8 rounded-lg ${
      darkMode ? "bg-gray-800" : "bg-gray-100"
    }`}>
      <Video className="w-12 h-12 mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">No {type} Streams</h3>
      <p className="text-gray-500 text-center">
        {type === "Live" 
          ? "There are no live streams at the moment."
          : "No previous streams found."}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <Loader/>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Start Stream Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Streams</h1>
          <button
            onClick={() => router.push("/streams/startnewlive")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
              darkMode 
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          >
            <Play className="w-5 h-5" />
            Start Live Stream
          </button>
        </div>

        {/* Live Streams Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Streams
          </h2>
          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <StreamCard key={stream._id} stream={stream} type="live" />
              ))}
            </div>
          ) : (
            <EmptyState type="Live" />
          )}
        </section>

        {/* Ended Streams Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Previous Streams
          </h2>
          {endedStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedStreams.map((stream) => (
                <StreamCard key={stream._id} stream={stream} type="ended" />
              ))}
            </div>
          ) : (
            <EmptyState type="Ended" />
          )}
        </section>
      </div>
    </div>
  );
};

export default StreamsPage;
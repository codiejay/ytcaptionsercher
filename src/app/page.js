"use client";
import { ChannelScrape } from "@/components/ChannelScrape";
import VideoCard from "@/components/VideoCard";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaYoutube } from "react-icons/fa";

const YouTubeCaptionViewer = () => {
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFullText, setShowFullText] = useState({});

  const searchVideos = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data.videos);
      console.log(data.videos);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowMore = (index) => {
    setShowFullText((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <Container maxW="4xl" p={6}>
      <Card>
        <CardHeader>
          <Heading size="lg">YouTube Caption Searcher</Heading>
        </CardHeader>
        <CardBody>
          <Flex gap={4}>
            <Input
              placeholder="Enter keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchVideos()}
              flex={1}
            />
            <Button
              onClick={searchVideos}
              isDisabled={isLoading}
              minW="100px"
              leftIcon={isLoading ? <Spinner size="sm" /> : <SearchIcon />}
            >
              {isLoading ? "Searching" : "Search"}
            </Button>
          </Flex>
          <ChannelScrape />

          {error && (
            <Alert status="error" mt={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <VStack mt={12} gap={0} align="stretch">
            <Heading display="flex" alignItems="center" gap={2}>
              <FaYoutube /> Matching Videos
            </Heading>
            <VStack mt={6} spacing={4} align="stretch">
              {videos.map((video, index) => (
                <VideoCard
                  key={index}
                  video={video}
                  index={index}
                  showFullText={showFullText}
                  toggleShowMore={toggleShowMore}
                />
              ))}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default YouTubeCaptionViewer;

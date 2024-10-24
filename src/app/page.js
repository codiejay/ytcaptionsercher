"use client";
import { ExternalLinkIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoMdEye, IoMdTime } from "react-icons/io";

const YouTubeCaptionViewer = () => {
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFullText, setShowFullText] = useState({});

  const decodeHtmlEntities = (text) => {
    if (!text) return "";

    return text
      .replace(/&amp;#39;/g, "'") // Handle double-encoded quotes first
      .replace(/&#39;/g, "'");
  };

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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (duration) => {
    const minutes = parseInt(duration.match(/(\d+)M/)?.[1] || "0", 10);
    const seconds = parseInt(duration.match(/(\d+)S/)?.[1] || "0", 10);
    return `${minutes}mins ${seconds}secs`;
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

          {error && (
            <Alert status="error" mt={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <VStack mt={6} spacing={4} align="stretch">
            {videos.map(
              (video, index) => (
                // I want to console log the video.captions
                console.log(video.captions),
                (
                  <Card key={index}>
                    <CardHeader>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Heading size="md">{video.name}</Heading>
                        <Button
                          as="a"
                          href={video.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          rightIcon={<ExternalLinkIcon />}
                          bg="#FF0000"
                          color="white"
                          _hover={{ bg: "#FF0000", opacity: 0.8 }}
                        >
                          Watch
                        </Button>
                      </Flex>
                      <Flex gap={4}>
                        <Flex alignItems="center" gap={1}>
                          <IoMdTime color="#FF0000" />
                          <Text fontSize="sm" color="gray.500">
                            {formatDuration(video.duration)}
                          </Text>
                        </Flex>
                        <Flex alignItems="center" gap={1}>
                          <IoMdEye color="#FF0000" />
                          <Text fontSize="sm" color="gray.500">
                            {parseInt(video.viewCount).toLocaleString()}
                          </Text>
                        </Flex>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Stack spacing={4}>
                        <Box>
                          <Heading size="sm" mb={2}>
                            Description:
                          </Heading>
                          <Text
                            fontSize="sm"
                            whiteSpace="pre-wrap"
                            noOfLines={showFullText[index] ? undefined : 5}
                          >
                            {video.description}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => toggleShowMore(index)}
                            variant="link"
                            colorScheme="blue"
                          >
                            {showFullText[index] ? "Show Less" : "Show More"}
                          </Button>
                        </Box>
                        <Box>
                          <Heading size="sm" mb={2}>
                            Captions:
                          </Heading>
                          <Text
                            fontSize="sm"
                            whiteSpace="pre-wrap"
                            noOfLines={showFullText[index] ? undefined : 5}
                          >
                            {video.captions
                              ? decodeHtmlEntities(video.captions)
                              : "No captions available"}
                          </Text>
                          <Button
                            size="sm"
                            onClick={() => toggleShowMore(index)}
                            variant="link"
                            colorScheme="blue"
                          >
                            {showFullText[index] ? "Show Less" : "Show More"}
                          </Button>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>
                )
              )
            )}
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default YouTubeCaptionViewer;

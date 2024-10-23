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

const YouTubeCaptionViewer = () => {
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  console.log(videos);
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
            {videos.map((video, index) => (
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
                  <Text fontSize="sm" color="gray.500">
                    Duration: {video.duration}
                  </Text>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    <Box>
                      <Heading size="sm" mb={2}>
                        Description:
                      </Heading>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {video.description}
                      </Text>
                    </Box>
                    <Box>
                      <Heading size="sm" mb={2}>
                        Captions:
                      </Heading>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {video.captions || "No captions available"}
                      </Text>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default YouTubeCaptionViewer;

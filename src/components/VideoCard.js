import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IoMdEye, IoMdTime } from "react-icons/io";

export const parseDuration = (videoDuration) => {
  if (!videoDuration) return "0h 0m 0s";

  const match = videoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0h 0m 0s";

  const hours = (match[1] || "0H").slice(0, -1);
  const minutes = (match[2] || "0M").slice(0, -1);
  const seconds = (match[3] || "0S").slice(0, -1);

  return `${hours}h ${minutes}m ${seconds}s`;
};

export const formatPublishedDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const decodeHtmlEntities = (text) => {
  if (!text) return "";

  return text
    .replace(/&amp;#39;/g, "'") // Handle double-encoded quotes first
    .replace(/&#39;/g, "'");
};

const VideoCard = ({ video, index, showFullText, toggleShowMore }) => {
  const videoDuration = video.videoDetail.contentDetails.duration;
  return (
    <Card>
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
              {parseDuration(videoDuration)}
            </Text>
          </Flex>
          <Flex alignItems="center" gap={1}>
            <IoMdEye color="#FF0000" />
            <Text fontSize="sm" color="gray.500">
              {parseInt(video.viewCount).toLocaleString()}
            </Text>
          </Flex>
          <Text fontSize="sm" color="gray.500">
            Published: {formatPublishedDate(video.publishedAt)}
          </Text>
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
  );
};

const ChannelVideoCard = ({ video, index, showFullText, toggleShowMore }) => {
  console.log(video);
  return (
    <Flex>
      <iframe
        width="250"
        height="250"
        style={{
          borderRadius: "10px",
        }}
        src={`https://www.youtube.com/embed/${video.videoDetail.id}`}
        title={video.name}
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </Flex>
  );
};

export { ChannelVideoCard, VideoCard };
export default VideoCard;

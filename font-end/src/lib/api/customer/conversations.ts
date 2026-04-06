import apiClient from "@/lib/api/apiClient";
import { PagedResult, ApiResponse } from "@/types/api.types";
import {
  ConversationListItemDTO,
  ConversationDetailDto,
  MessageDto,
  ToggleReactionRequestDto,
  ToggleReactionResponseDto,
} from "@/types/customer/user.types";
import {
  CreateDirectConversationRequestDto,
  ConversationResponseDto,
  GetMessagesQuery,
  MessageHistoryResponseDto,
  SendMessageDto,
} from "@/types/customer/conversation";
import { SearchMessagesRequestParams, GetMessageContextRequest, MessageContextResponseDto, LinkPreviewRequestParams, LinkPreviewData } from "@/types/customer/hub.types";

export interface GetMyConversationsParams {
  pageParam: number;
  pageSize?: number;
  filter?: "direct" | "group";
  searchTerm?: string;
}

/**
 * Fetches the current user's conversations with pagination, filtering, and search support
 */
export async function getMyConversations({
  pageParam,
  pageSize = 20,
  filter,
  searchTerm,
}: GetMyConversationsParams): Promise<PagedResult<ConversationListItemDTO>> {
  const params = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (filter) {
    params.append("filter", filter);
  }

  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }

  try {
    const response = await apiClient.get(
      `/conversations/me?${params.toString()}`
    );
    const apiResponse = response.data as ApiResponse<
      PagedResult<ConversationListItemDTO>
    >;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

/**
 * Fetches detailed information about a specific conversation, including the first page of messages
 * @param conversationId - The ID of the conversation to fetch
 * @param pageSize - Optional page size for messages
 * @returns Promise<ConversationDetailDto> - Detailed conversation information with messages
 */
export async function getConversationDetails(
  conversationId: number,
  pageSize?: number
): Promise<ConversationDetailDto> {
  const params = new URLSearchParams();

  if (pageSize) {
    params.append("pageSize", pageSize.toString());
  }

  try {
    const url = `/conversations/${conversationId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    const apiResponse = response.data as ApiResponse<ConversationDetailDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
}

/**
 * Finds an existing direct conversation or creates a new one with the specified user
 * @param request - The request payload containing the partner user ID
 * @returns Promise<ConversationResponseDto> - Conversation details with creation status
 */
export async function findOrCreateDirectConversation(
  request: CreateDirectConversationRequestDto
): Promise<ConversationResponseDto> {
  try {
    const response = await apiClient.post("/conversations/direct", request);
    const apiResponse = response.data as ApiResponse<ConversationResponseDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error creating/finding direct conversation:", error);
    throw error;
  }
}

/**
 * Hides a conversation for the current user (soft delete)
 * @param conversationId - The ID of the conversation to hide
 * @returns Promise<void> - Returns nothing on success (204 NoContent)
 */
export async function deleteConversation(
  conversationId: number
): Promise<void> {
  try {
    const response = await apiClient.delete(`/conversations/${conversationId}`);
    // For DELETE requests that return 204 NoContent, response.data might be empty
    // but we still check if there's an ApiResponse wrapper for consistency
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      const apiResponse = response.data as ApiResponse<null>;
      // Even if successful, we don't need to return the data for delete operations
    }
  } catch (error) {
    console.error("Error hiding conversation:", error);
    throw error;
  }
}

/**
 * Fetches message history for a conversation using cursor-based pagination
 * @param conversationId - The ID of the conversation
 * @param query - Query parameters including cursor and limit
 * @returns Promise<MessageHistoryResponseDto> - Paginated message history
 */
export async function getMessageHistory(
  conversationId: number,
  query: GetMessagesQuery = {}
): Promise<MessageHistoryResponseDto> {
  const params = new URLSearchParams();

  if (query.beforeMessageId) {
    params.append("beforeMessageId", query.beforeMessageId);
  }

  if (query.limit) {
    params.append("limit", query.limit.toString());
  }

  try {
    const url = `/conversations/${conversationId}/messages${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    const apiResponse = response.data as ApiResponse<MessageHistoryResponseDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching message history:", error);
    throw error;
  }
}

/**
 * Sends a new message to a conversation
 * @param conversationId - The ID of the conversation
 * @param messageData - The message data to send
 * @returns Promise<MessageDto> - The created message
 */
export async function sendMessage(
  conversationId: number,
  messageData: SendMessageDto
): Promise<MessageDto> {
  try {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      messageData
    );
    const apiResponse = response.data as ApiResponse<MessageDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Deletes (recalls) a message from a conversation
 */
export async function deleteMessage(
  conversationId: number,
  messageId: string
): Promise<void> {
  try {
    const response = await apiClient.delete(
      `/conversations/${conversationId}/messages/${messageId}`
    );
    
    // For DELETE operations that return 204 No Content, we don't need to extract data
    // but we still wrap it to ensure consistent error handling
    const apiResponse = response.data as ApiResponse<void>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

/**
 * Toggles a reaction on a message (adds if not present, removes if present)
 * @param conversationId - The ID of the conversation
 * @param messageId - The ID of the message to react to
 * @param reactionData - The reaction data containing the emoji code
 * @returns Promise<ToggleReactionResponseDto> - The updated reactions list
 */
export async function toggleMessageReaction(
  conversationId: number,
  messageId: string,
  reactionData: ToggleReactionRequestDto
): Promise<ToggleReactionResponseDto> {
  try {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/toggle-reaction`,
      reactionData
    );
    const apiResponse = response.data as ApiResponse<ToggleReactionResponseDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error toggling message reaction:", error);
    throw error;
  }
}

/**
 * Searches for messages within a conversation containing specific keywords
 * @param conversationId - The ID of the conversation to search in
 * @param params - Search parameters including query, pagination
 * @returns Promise<PagedResult<MessageDto>> - Paginated search results
 */
export async function searchMessages(
  conversationId: number,
  params: SearchMessagesRequestParams
): Promise<PagedResult<MessageDto>> {
  const searchParams = new URLSearchParams();
  
  // Add query parameter - try different common parameter names
  if (params.query && params.query.trim()) {
    // Try multiple common parameter names that backends might expect
    searchParams.append("term", params.query.trim()); // Common for search APIs
    // searchParams.append("q", params.query.trim()); 
    // searchParams.append("query", params.query.trim());
    // searchParams.append("search", params.query.trim());
  }

  // Add pagination parameters
  if (params.pageNumber && params.pageNumber > 0) {
    searchParams.append("pageNumber", params.pageNumber.toString());
  }

  if (params.pageSize && params.pageSize > 0) {
    searchParams.append("pageSize", params.pageSize.toString());
  }

  const url = `/conversations/${conversationId}/messages/search?${searchParams.toString()}`;
  console.log("[API] Search URL:", url);
  console.log("[API] Search params:", params);
  
  try {
    const response = await apiClient.get(url);
    const apiResponse = response.data as ApiResponse<PagedResult<MessageDto>>;
    return apiResponse.data;
  } catch (error) {
    console.error("[API] Error searching messages:", error);
    console.error("[API] Request URL:", url);
    console.error("[API] Request params:", params);
    throw error;
  }
}

/**
 * Fetches the context around a specific message (messages before and after it)
 * @param conversationId - The ID of the conversation
 * @param params - Request parameters including target messageId and pageSize
 * @returns Promise<MessageContextResponseDto> - Context slice around the target message
 */
export async function getMessageContext(
  conversationId: number,
  params: GetMessageContextRequest
): Promise<MessageContextResponseDto> {
  const searchParams = new URLSearchParams({
    messageId: params.messageId,
  });

  if (params.pageSize) {
    searchParams.append("pageSize", params.pageSize.toString());
  }

  try {
    const url = `/conversations/${conversationId}/messages/context?${searchParams.toString()}`;
    const response = await apiClient.get(url);
    const apiResponse = response.data as ApiResponse<MessageContextResponseDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching message context:", error);
    throw error;
  }
}

/**
 * Fetches link preview metadata directly from the URL (client-side)
 * @param params - Request parameters containing the URL to preview
 * @returns Promise<LinkPreviewData> - Link metadata including title, description, image
 */
export async function fetchLinkPreview(
  params: LinkPreviewRequestParams
): Promise<LinkPreviewData> {
  try {
    console.log("[LinkPreview] Fetching metadata for:", params.url);
    
    // For YouTube, extract video ID and use YouTube oEmbed API
    const youtubeMatch = params.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      
      try {
        // Try YouTube oEmbed API for better metadata
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(params.url)}&format=json`;
        const oembedResponse = await fetch(oembedUrl);
        const oembedData = await oembedResponse.json();
        
        if (oembedData.title) {
          return {
            url: params.url,
            title: oembedData.title,
            description: `by ${oembedData.author_name || 'YouTube'}`,
            image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            siteName: "YouTube",
            favicon: "https://www.youtube.com/favicon.ico",
            type: 'video'
          };
        }
      } catch (oembedError) {
        console.log("[LinkPreview] YouTube oEmbed failed, using fallback");
      }
      
      // Fallback for YouTube
      return {
        url: params.url,
        title: `YouTube Video`,
        description: "Click to watch on YouTube",
        image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        siteName: "YouTube",
        favicon: "https://www.youtube.com/favicon.ico",
        type: 'video'
      };
    }

    // For other URLs, try to fetch using a CORS proxy or return basic info
    try {
      // Use a public CORS proxy service for fetching metadata
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(params.url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Extract Open Graph or meta tags
        const title = 
          doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
          doc.querySelector('title')?.textContent ||
          params.url;
          
        const description = 
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
          '';
          
        const image = 
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          '';
          
        const siteName = 
          doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
          new URL(params.url).hostname;

        return {
          url: params.url,
          title: title.trim(),
          description: description.trim(),
          image: image || undefined,
          siteName: siteName || undefined,
          type: 'website'
        };
      }
    } catch (fetchError) {
      console.log("[LinkPreview] CORS fetch failed, using basic preview:", fetchError);
    }
    
    // Fallback to basic URL info
    const domain = new URL(params.url).hostname;
    return {
      url: params.url,
      title: domain,
      description: params.url,
      siteName: domain,
      type: 'website'
    };
    
  } catch (error) {
    console.error("[LinkPreview] Error fetching link preview:", error);
    
    // Return basic preview data if everything fails
    return {
      url: params.url,
      title: params.url,
      type: 'website'
    };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import axios from 'axios';
import { load } from 'cheerio';
export const SendDm = async(id:string,message:any)=>{
    await fetch(`${process.env.BASE!}/v22.0/${process.env.USER_ID}/messages`,{
        method:'POST',
        body :JSON.stringify({
            recipient:{
                id
            },
            message
        }),
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json',
          },
    }).then(async(res)=>{
    const data = await res.json()
    console.log(data)
  })
}
interface LinkDetails {
    resolution: string;
    extension: string;
    videoLink: string;
  }
  
  interface VideoDetails {
    title: string;
    thumbnail: string;
    links: LinkDetails[];
  }
  
  export async function extractVideoDetails(data: any): Promise<VideoDetails> {
    const videoDetails: VideoDetails = {
      title: data.title,
      thumbnail: data.picture,
      links: data.links.map((link: { qualityLabel: any; mimeType: string; link: any }) => ({
        resolution: link.qualityLabel,
        extension: link.mimeType.split(';')[0].split('/')[1], // Extract file extension from mimeType
        videoLink: link.link,
      })),
    };
  
    return videoDetails;
  }
  



export async function getYouTubeMetadata(url: string): Promise<{ title: string | null; thumbnailUrl: string | null }> {
    try {
        // Fetch the YouTube page content using axios
        const response = await axios.get(url);

        // Load the page content into cheerio
        const $ = load(response.data);

        // Extract the title from the meta tag
        const title = $('meta[name="title"]').attr('content') || null;

        // Extract the thumbnail URL from the og:image meta tag
        const thumbnailUrl = $('meta[property="og:image"]').attr('content') || null;

        return { title, thumbnailUrl };
    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        return { title: null, thumbnailUrl: null };
    }
}
export async function extractYouTubeVideoId(url: string):Promise< string | null> {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([\w-]+)|(?:watch|playlist)\?v=([\w-]+)(?:\&\S*)?)|youtu\.be\/([\w-]+))/i;
    const match = url.match(youtubeRegex);

    if (match) {
        // Check if we have a captured video ID
        return match[1] || match[2] || match[3] || match[4] || null;
    }
    return null; // Return null if no match is found
}

export async function getYouTubeVideoData(url:string) {
    console.log('fethig')
    const apiUrl = `https://youtube-video-and-shorts-downloader1.p.rapidapi.com/api/getYTVideo?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.KEY!,
                'x-rapidapi-host': 'youtube-video-and-shorts-downloader1.p.rapidapi.com'
            }
        });
        const result = await response.json();  // Assuming the response is JSON, you can use .json() to parse it.
        console.log(result)
        return result;
    } catch (error) {
        console.error('Error fetching YouTube video data:', error);
        return null;
    }
}

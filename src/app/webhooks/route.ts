import { extractVideoDetails, extractYouTubeVideoId, getYouTubeMetadata, getYouTubeVideoData, SendDm } from "@/actions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req:NextRequest)=>{
    const hub = req.nextUrl.searchParams.get("hub.challenge")
    return new NextResponse(hub)
}

export const POST = async(req:NextRequest)=>{
 const body = await req.json()
try {
    if(body.entry[0].messaging){
        const messaging = body.entry[0].messaging[0]
        const message = messaging.message;
        if(message.attachments){
            const attachment = message.attachments[0];
            if(attachment.type==='ig_reel'){
                const payload = attachment.payload;
                const message = {
                    attachment: {
                        type: 'template',
                        payload:{
                            template_type: "button",
                            text: payload.title.slice(0, 50)+'....',
                            buttons:[
                                {
                                    type:"web_url",
                                    url: payload.url,
                                    title: 'Download reel',
                                }
                            ]
                        },
                   
                    }
                };
                await SendDm(messaging.sender.id, message)
            }
            else if(attachment.type==='share'){
                const payload = attachment.payload;
                const message = {
                    attachment: {
                        type: 'template',
                        payload:{
                            template_type: "button",
                            text: 'Sorry but for post i can only give you the first pic',
                            buttons:[
                                {
                                    type:"web_url",
                                    url: payload.url,
                                    title: 'Download only one pic'
                                }
                            ]
                        },
                   
                    }
                };
                await SendDm(messaging.sender.id, message)
            }     
        }
        else{
            if(message.is_unsupported===true) {
                await SendDm(messaging.sender.id, {text:'bvc no stories , you stalker'})
    
            }
            const text = message.text;
            const isYoutubeVideo = await extractYouTubeVideoId(text);
            if(isYoutubeVideo){
                await SendDm(messaging.sender.id, {text: 'getting youtube video,please wait'})
    
              try {
                const details = await getYouTubeMetadata(text);
                const stream = await getYouTubeVideoData(text);
               const formated_stream = await extractVideoDetails(stream)
               const videos_links = formated_stream.links.map((link)=>{
                return   {
                    type:"web_url",
                    url: link.videoLink,
                    title: `Download ${link.resolution}.${link.extension}`
                }
               })
                const message = {
                    attachment: {
                        type: 'template',
                        payload:{
                            "template_type":"generic",
                            text: details.title,
                            elements: [
                                    {
                                        title: details.title,
                                        image_url: details.thumbnailUrl,
                                        buttons:[
                                            videos_links[0],
                                            videos_links[1],
                                            videos_links[2]
                                        ]
                                    }
                            ],
                         
                        },
                   
                    }
                };
                await SendDm(messaging.sender.id, message)
              } catch (error) {
                console.log(error)
                await SendDm(messaging.sender.id, {text: 'error getting yt video try next month'})
    
              }
            }
        }
     }
     
} catch (error) {
 console.log(error)   
}
    return NextResponse.json("message sent", {status:200})
}
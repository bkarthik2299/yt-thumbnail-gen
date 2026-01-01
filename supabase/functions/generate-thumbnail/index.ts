import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not configured");
      return new Response(
        JSON.stringify({ error: "Replicate API token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${body.predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const prediction = await response.json();
      console.log("Status check response:", JSON.stringify(prediction));
      
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If it's a generation request
    const { prompt, numOutputs = 3 } = body;
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating thumbnails with prompt:", prompt);

    // Create prediction with justmalhar/flux-thumbnails-v2
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "cce0e4dc1c2a1a74393d8b7d0a77e99da24cd8e6a15bae9b7d41eb68cd02ffcf",
        input: {
          prompt: prompt,
          num_outputs: numOutputs,
          aspect_ratio: "16:9",
          output_format: "png",
          output_quality: 90,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
      }),
    });

    const prediction = await response.json();
    console.log("Create prediction response:", JSON.stringify(prediction));

    if (prediction.error) {
      console.error("Replicate API error:", prediction.error);
      return new Response(
        JSON.stringify({ error: prediction.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error in generate-thumbnail function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

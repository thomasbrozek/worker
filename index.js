export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
      if (!body.prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const aiRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENROUTER_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "Extract 5–10 decision criteria from the user's prompt. Respond ONLY with a JSON array of short category names. Example: [\"Cost\", \"Weather\", \"Safety\"]",
              },
              { role: "user", content: body.prompt },
            ],
          }),
        }
      );

      const data = await aiRes.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "OpenRouter request failed",
          details: err.toString(),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
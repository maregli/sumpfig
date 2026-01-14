using SoundCloudExplode;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container
builder.Services.AddSingleton<ISoundCloudClient>(sp => new SoundCloudClient());
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Initialize SoundCloud client on startup
var soundcloud = app.Services.GetRequiredService<ISoundCloudClient>();
await soundcloud.InitializeAsync();

// Get track metadata endpoint
app.MapPost("/api/soundcloud/track", async (
    [FromBody] TrackRequest request,
    ISoundCloudClient soundcloud,
    CancellationToken cancellationToken) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return Results.BadRequest(new { error = "URL is required" });
        }

        if (!request.Url.StartsWith("https://soundcloud.com/"))
        {
            return Results.BadRequest(new { error = "Invalid SoundCloud URL" });
        }

        var track = await soundcloud.Tracks.GetAsync(request.Url, cancellationToken);

        var response = new
        {
            id = track.Id,
            title = track.Title,
            artist = track.User?.Username,
            artist_name = track.User?.FullName,
            duration = track.Duration, // milliseconds
            duration_seconds = track.Duration > 0 ? track.Duration / 1000.0 : 0,
            genre = track.Genre,
            likes_count = track.LikesCount,
            playback_count = track.PlaybackCount,
            permalink_url = track.PermalinkUrl,
            artwork_url = track.ArtworkUrl,
            description = track.Description,
            created_at = track.CreatedAt,
            release_date = track.ReleaseDate,
            downloadable = track.Downloadable,
            streamable = track.Streamable,
            user = track.User != null ? new
            {
                id = track.User.Id,
                username = track.User.Username,
                full_name = track.User.FullName,
                permalink_url = track.User.PermalinkUrl,
                avatar_url = track.User.AvatarUrl
            } : null
        };

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Error fetching track data",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("GetTrackMetadata");

// Get playlist metadata endpoint
app.MapPost("/api/soundcloud/playlist", async (
    [FromBody] PlaylistRequest request,
    ISoundCloudClient soundcloud,
    CancellationToken cancellationToken) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return Results.BadRequest(new { error = "URL is required" });
        }

        if (!request.Url.StartsWith("https://soundcloud.com/"))
        {
            return Results.BadRequest(new { error = "Invalid SoundCloud URL" });
        }

        var playlist = await soundcloud.Playlists.GetAsync(
            request.Url,
            request.LoadTracks ?? false,
            cancellationToken
        );

        var response = new
        {
            id = playlist.Id,
            title = playlist.Title,
            description = playlist.Description,
            duration = playlist.Duration, // milliseconds
            track_count = playlist.TrackCount,
            artwork_url = playlist.ArtworkUrl,
            permalink_url = playlist.PermalinkUrl,
            created_at = playlist.CreatedAt,
            user = playlist.User != null ? new
            {
                id = playlist.User.Id,
                username = playlist.User.Username,
                full_name = playlist.User.FullName,
                permalink_url = playlist.User.PermalinkUrl,
                avatar_url = playlist.User.AvatarUrl
            } : null,
            tracks = playlist.Tracks?.Select(t => new
            {
                id = t.Id,
                title = t.Title,
                duration = t.Duration, // milliseconds
                permalink_url = t.PermalinkUrl,
                artwork_url = t.ArtworkUrl
            }).ToList()
        };

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Error fetching playlist data",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("GetPlaylistMetadata");

// Search endpoint
app.MapPost("/api/soundcloud/search", async (
    [FromBody] SearchRequest request,
    ISoundCloudClient soundcloud,
    CancellationToken cancellationToken) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return Results.BadRequest(new { error = "Query is required" });
        }

        var limit = request.Limit ?? 20;
        var tracksEnumerable = soundcloud.Search.GetTracksAsync(request.Query);
        var tracks = new List<SoundCloudExplode.Search.TrackSearchResult>();
        
        await foreach (var track in tracksEnumerable.WithCancellation(cancellationToken))
        {
            tracks.Add(track);
            if (tracks.Count >= limit) break;
        }

        var response = tracks.Select(t => new
        {
            id = t.Id,
            title = t.Title,
            duration = t.Duration, // milliseconds
            genre = t.Genre,
            likes_count = t.LikesCount,
            playback_count = t.PlaybackCount,
            permalink_url = t.PermalinkUrl,
            artwork_url = t.ArtworkUrl,
            user = t.User != null ? new
            {
                username = t.User.Username,
                full_name = t.User.FullName
            } : null
        });

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Error searching tracks",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("SearchTracks");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck");

app.Run();

// Request models
record TrackRequest(string Url);
record PlaylistRequest(string Url, bool? LoadTracks);
record SearchRequest(string Query, int? Limit);

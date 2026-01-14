# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the main service project
COPY soundcloud-service/SoundCloudService.csproj soundcloud-service/
# Copy the SoundCloudExplode library
COPY SoundCloudExplode/SoundCloudExplode/SoundCloudExplode.csproj SoundCloudExplode/SoundCloudExplode/

# Restore dependencies
WORKDIR /src/soundcloud-service
RUN dotnet restore

# Copy the rest of the files
WORKDIR /src
COPY soundcloud-service/ soundcloud-service/
COPY SoundCloudExplode/SoundCloudExplode/ SoundCloudExplode/SoundCloudExplode/

# Build the application
WORKDIR /src/soundcloud-service
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5002

ENTRYPOINT ["dotnet", "SoundCloudService.dll"]

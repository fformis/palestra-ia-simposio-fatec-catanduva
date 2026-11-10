FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /app
COPY . .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
CMD ["dotnet", "watch", "run", "--project", "src/Palestra.Api", "--no-launch-profile"]

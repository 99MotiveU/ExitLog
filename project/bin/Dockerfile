FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/myapp.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar", "Exitlog-1.0.jar"]

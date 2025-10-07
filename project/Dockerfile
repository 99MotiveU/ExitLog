FROM openjdk:17-jdk-slim 
WORKDIR /app
ARG JAR_FILE=target/ExitLog-0.1-SNAPSHOT.jar 
COPY ${JAR_FILE} app.jar
EXPOSE 8080 
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
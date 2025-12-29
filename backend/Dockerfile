FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy only what we need for dependency caching first
COPY pom.xml /build/pom.xml
COPY .mvn /build/.mvn
COPY mvnw /build/mvnw
COPY services /build/services

RUN chmod +x /build/mvnw && /build/mvnw -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}

COPY --from=build /build/services/${SERVICE}/target/${SERVICE}-0.1.0-SNAPSHOT.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]


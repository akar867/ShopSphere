FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml /build/pom.xml
COPY mvnw /build/mvnw
COPY .mvn /build/.mvn
COPY services /build/services

RUN chmod +x /build/mvnw && /build/mvnw -pl services/api-gateway -am -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /build/services/api-gateway/target/api-gateway-0.1.0-SNAPSHOT.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]


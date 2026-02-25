#version 410 core

in vec3 fPosition;
in vec3 fNormal;
in vec2 fTexCoords;
in vec4 fPosEye;
in vec4 fragPosLightSpace;

out vec4 fColor;

uniform mat4 model;
uniform mat4 view;
uniform mat3 normalMatrix;
uniform mat3 lightDirMatrix;

uniform vec3 lightDir;
uniform vec3 lightColor;

uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

uniform int redLightStarted;
uniform vec3 pointLightPos;        

vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;
vec3 ambient;
float ambientStrength = 0.5f;
vec3 diffuse;

float constant = 1.0f;
float linear = 0.014f;
float quadratic = 0.0007f;

void computeDirLight() {
    vec3 cameraPosEye = vec3(0.0f);
    vec3 normalEye = normalize(normalMatrix * fNormal);
    vec3 lightDirN = normalize(lightDir);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
        
    ambient = ambientStrength * lightColor;
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
    
    vec3 reflection = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
    specular = specularStrength * specCoeff * lightColor;
}

float computeShadow() {
    vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    normalizedCoords = normalizedCoords * 0.5 + 0.5;

    if (normalizedCoords.z > 1.0f) return 0.0f;
    
    float currentDepth = normalizedCoords.z;
    float bias = 0.005f;

    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
    
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(shadowMap, normalizedCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    return shadow;
}

void computePointLight(vec3 color) {
    vec3 cameraPosEye = vec3(0.0f);
    vec4 lightPosEye = view * vec4(pointLightPos, 1.0f);
    
    vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);
    vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
    vec3 halfVector = normalize(lightDirN + viewDirN);
    vec3 normalEye = normalize(normalMatrix * fNormal);

    float constant = 1.0f;
    float linear = 0.09f;
    float quadratic = 0.032f;
    float dist = length(lightPosEye.xyz - fPosEye.xyz);
    float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));

    ambient += att * ambientStrength * color;
    diffuse += att * max(dot(normalEye, lightDirN), 0.0f) * color;
    
    float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininess);
    specular += att * specularStrength * specCoeff * color;
}

float computeFog() {
    float fogDensity = 0.008f; 
    float fragmentDistance = length(fPosEye);
    float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2.0f));
    return clamp(fogFactor, 0.0f, 1.0f);
}

void main() {
    vec4 texColor = texture(diffuseTexture, fTexCoords);

    computeDirLight();

    if (redLightStarted == 1) {
        computePointLight(vec3(1.0f, 0.0f, 0.0f)); 
    }
    
    ambient *= texColor.rgb;
    diffuse *= texColor.rgb;
    specular *= texture(specularTexture, fTexCoords).rgb;
    
    float shadow = computeShadow();
    vec3 lighting = min((ambient + (1.0f - shadow) * diffuse) + (1.0f - shadow) * specular, 1.0f);
    
    vec4 resultColor = vec4(lighting, 1.0f);

    float fogFactor = computeFog();
    vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f); 
    
    fColor = mix(fogColor, resultColor, fogFactor);
}
#include "Camera.hpp"

namespace gps {

Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
    this->cameraPosition = cameraPosition;
    this->cameraTarget = cameraTarget;
    this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
    this->cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp));
    this->cameraUpDirection = glm::cross(cameraRightDirection, cameraFrontDirection);
}

//return the view matrix, using the glm::lookAt() function
glm::mat4 Camera::getViewMatrix() {
    //TODO
    return glm::lookAt(cameraPosition, cameraPosition + cameraFrontDirection, cameraUpDirection);
}

glm::vec3 Camera::getCameraPosition()
{
    return cameraPosition;
}

void Camera::setNewPosition(const glm::vec3& newPosition) {
    this->cameraPosition = newPosition;
    
    this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
    this->cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection));
    this->cameraUpDirection = glm::cross(cameraRightDirection, cameraFrontDirection);
}

void Camera::move(MOVE_DIRECTION direction, float speed) {
    switch(direction){
        case MOVE_FORWARD:
            cameraPosition += cameraFrontDirection * speed;
            cameraTarget += cameraFrontDirection * speed;
            break;
            
        case MOVE_BACKWARD:
            cameraPosition -= cameraFrontDirection * speed;
            cameraTarget -= cameraFrontDirection * speed;
            break;
            
        case MOVE_RIGHT:
            cameraPosition += cameraRightDirection * speed;
            cameraTarget += cameraRightDirection * speed;
            break;
            
        case MOVE_LEFT:
            cameraPosition -= cameraRightDirection * speed;
            cameraTarget -= cameraRightDirection * speed;
            break;
            
        case MOVE_UP:
            cameraPosition += cameraUpDirection * speed;
            cameraTarget += cameraUpDirection * speed;
            break;
            
        case MOVE_DOWN:
            cameraPosition -= cameraUpDirection * speed;
            cameraTarget -= cameraUpDirection * speed;
            break;
            
        default:
            break;
    }
}

void Camera::rotate(float pitch, float yaw) {
        glm::vec3 front;
        front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front.y = sin(glm::radians(pitch));
        front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        
        cameraFrontDirection = glm::normalize(front);
        
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f)));
        
        cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, cameraFrontDirection));
    }

bool Camera::isInsideSquare(const glm::vec3& minBounds, const glm::vec3& maxBounds) const {
    return (cameraPosition.x >= minBounds.x && cameraPosition.x <= maxBounds.x &&
            cameraPosition.y >= minBounds.y && cameraPosition.y <= maxBounds.y);
}
}


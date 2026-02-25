cmake_minimum_required(VERSION 3.10)
project(ProjectGP)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_definitions(-DGLM_ENABLE_EXPERIMENTAL)

if(APPLE)
    if(EXISTS "/opt/homebrew")
        include_directories("/opt/homebrew/include")
        link_directories("/opt/homebrew/lib")
    elseif(EXISTS "/usr/local")
        include_directories("/usr/local/include")
        link_directories("/usr/local/lib")
    endif()
endif()

find_package(OpenGL REQUIRED)
find_package(GLEW REQUIRED)
find_package(glfw3 REQUIRED)
find_package(glm REQUIRED)

file(GLOB SOURCES "*.cpp")

add_executable(ProjectGP ${SOURCES})

if(APPLE)
    target_link_libraries(ProjectGP
        ${OPENGL_LIBRARIES}
        GLEW::GLEW
        glfw
        "-framework IOKit"
        "-framework Cocoa"
        "-framework CoreVideo"
    )
else()
    target_link_libraries(ProjectGP
        ${OPENGL_LIBRARIES}
        GLEW::GLEW
        glfw
    )
endif()

file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/shaders DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
file(COPY ${CMAKE_CURRENT_SOURCE_DIR}/objects DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
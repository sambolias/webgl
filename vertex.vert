uniform mat4 MvMatrix;
uniform mat4 PMatrix;

attribute vec3 aPos; 

varying vec2 tex_pos;

void main() 
{ 
    tex_pos = aPos.xy; 
    gl_Position = PMatrix * MvMatrix * vec4(aPos, 1.); 
}
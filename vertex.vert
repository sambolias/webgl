uniform mat4 MvMatrix;
uniform mat4 PMatrix;

attribute vec3 aPos; 
attribute vec3 aNorm;

varying vec3 vPos;
varying vec3 vNorm;

void main() 
{ 
    vPos = aPos; 
    vNorm = aNorm;

    gl_Position = PMatrix * MvMatrix * vec4(aPos, 1.); 

}
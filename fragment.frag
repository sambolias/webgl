#ifdef GL_ES
precision mediump float;
#endif

varying vec2 tex_pos; 

uniform sampler2D tex;

void main() 
{ 
    vec4 color = texture2D(tex, tex_pos); 
    gl_FragColor = vec4(1.,1.,1.,1.); 
}
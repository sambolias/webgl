#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vPos; 
varying vec3 vNorm;

uniform sampler2D tex;

vec4 getLightColor(
    vec4 lightColor,
    vec4 lightPos,
    vec4 paintColor,
    vec3 surfPos,
    vec3 surfNorm)
{
    //get unit vector from light position to point where light hits
    vec3 lightDir = normalize(lightPos.xyz - surfPos*lightPos.w);

    // ambient light
    float ambientCoeff = 0.6;
    vec4 ambientColor = ambientCoeff * lightColor * paintColor;

    // diffuse light    //should be max of 0, dot(...) but somethings wrong with normals
    float lambertCos = abs( dot(surfNorm, lightDir));
    vec4 diffuseColor = lambertCos * lightColor * paintColor;

    return clamp(ambientColor + diffuseColor,
                 0., 1.);
}

void main() 
{ 
    vec4 color = texture2D(tex, vPos.xy); 

    vec3 norm = normalize(vNorm);

    vec4 lightcolor = vec4(1., 1., 1., 1.);
    vec4 lightpos = vec4(0., -15., 5., 20.);
    vec4 finalColor = getLightColor(lightcolor,lightpos,color,vPos,norm);
    
    gl_FragColor = vec4(finalColor.rgb, 1.); 
}
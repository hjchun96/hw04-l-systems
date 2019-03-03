#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main(){

  // out_Col = vec4(finalColor, 1);
  vec4 SAD_BLUE = vec4(188./255., 198./255.,214./255., 1.0);
  vec4 WHITE = vec4(250./255., 250./255.,250./255., 0.5);
  vec4 GREY = vec4(181./255., 185./255.,186./255.,0.9);

  if (fs_Pos.y < -0.4) {
    out_Col = GREY;
  } else if (fs_Pos.y < -0.2){
    float to_grey = abs(-0.2-fs_Pos.y);
    float to_white = abs(fs_Pos.y);
    float gr = to_grey/(to_grey + to_white);
    out_Col = GREY *gr*3.0;
  } else if (fs_Pos.y < 0.0) {
    out_Col = WHITE;
  } else if (fs_Pos.y < 0.3) {
    float to_blue = abs(0.5 - fs_Pos.y);
    float to_white = abs(0.3 - fs_Pos.y);
    float br = to_blue/(to_blue + to_white);
    out_Col = SAD_BLUE *br + WHITE *(1.-br);
  } else if (fs_Pos.y < 0.5){
    out_Col = SAD_BLUE;
  } else {
    out_Col = SAD_BLUE;
  }
//  vec4 BW_BLEND = vec4(228./255., 246./255.,248./255., 1.0);

 //vec4(227./255., 224./255.,241./255., 1.0);//vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);

}

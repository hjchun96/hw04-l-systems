#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform int u_Season;

in vec2 fs_Pos;
out vec4 out_Col;


vec4 SAD_BLUE = vec4(188./255., 198./255.,214./255., 1.0);
vec4 GREY = vec4(181./255., 185./255.,186./255.,0.9);
vec4 WHITE = vec4(250./255., 250./255.,250./255., 0.5);
vec4 LUSH_GREEN = vec4(96./255., 135./255.,6./255., 0.9);
vec4 BLUE = vec4(64./255., 162./255.,239./255.,1.0);
vec4 SKY_BLUE = vec4(165./255., 211./255.,186./247.,0.2);
vec4 ORANGE = vec4(165./255., 117./255.,4./255., 0.9);


void main() {
  vec4 TOP, MID, BOTTOM;
  if (u_Season == 1) { // WINTER
    TOP = SAD_BLUE;
    MID = WHITE;
    BOTTOM = GREY;
  } else if (u_Season == 2) { // SUMMER
    TOP = BLUE;
    MID = BLUE;
    BOTTOM = LUSH_GREEN;
  } else { //FALL
    TOP = BLUE;
    MID = BLUE;
    BOTTOM = ORANGE;
  }

  if (fs_Pos.y < -0.4) {
    out_Col = BOTTOM;
  } else if (fs_Pos.y < -0.2){
    float to_grey = abs(-0.2-fs_Pos.y);
    float to_white = abs(fs_Pos.y);
    float gr = to_grey/(to_grey + to_white);
    out_Col = BOTTOM *gr*3.0;
  } else if (fs_Pos.y < 0.0) {
    out_Col = MID;
  } else if (fs_Pos.y < 0.3) {
    float to_blue = abs(0.5 - fs_Pos.y);
    float to_white = abs(0.3 - fs_Pos.y);
    float br = to_blue/(to_blue + to_white);
    out_Col = TOP *br + MID *(1.-br);
  } else if (fs_Pos.y < 0.5){
    out_Col = TOP;
  } else {
    out_Col = TOP;
  }
//  vec4 BW_BLEND = vec4(228./255., 246./255.,248./255., 1.0);

 //vec4(227./255., 224./255.,241./255., 1.0);//vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);

}

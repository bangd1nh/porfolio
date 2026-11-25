/**
 * Motion tiers.
 *
 * - "full": GPU-composited machine — every effect runs.
 * - "lite": software rendering (no GPU, hardware acceleration turned off,
 *   blocklisted driver) or a very weak CPU. Heavy compositing work (3D tilt,
 *   blend modes, scroll scrubbing, infinite decorative loops, the custom
 *   cursor) is dropped; the dot field stays but only repaints around the
 *   pointer.
 *
 * The tier is resolved before first paint by MOTION_TIER_SCRIPT and stored on
 * <html data-motion="…">, so CSS and client code read the same answer.
 *
 * Manual override for testing: `?motion=lite`, `?motion=full`, `?motion=auto`
 * (persists in localStorage until reset with `auto`).
 */
export type MotionTier = "full" | "lite"

export const MOTION_TIER_ATTRIBUTE = "data-motion"

export function getMotionTier(): MotionTier {
  if (typeof document === "undefined") return "full"
  return document.documentElement.dataset.motion === "lite" ? "lite" : "full"
}

export function isLiteMotion(): boolean {
  return getMotionTier() === "lite"
}

/**
 * Runs inline in <head>. WebGL with `failIfMajorPerformanceCaveat` refuses to
 * start on software renderers, which is exactly the "no GPU / acceleration
 * off" case; the renderer string catches SwiftShader/llvmpipe fallbacks that
 * slip through. The probe result is cached per session.
 */
export const MOTION_TIER_SCRIPT = `(function(){
var K="motion-tier";
function detect(){
  try{
    if(navigator.connection&&navigator.connection.saveData)return"lite";
    if((navigator.hardwareConcurrency||8)<=2)return"lite";
    var c=document.createElement("canvas");
    var o={failIfMajorPerformanceCaveat:true};
    var gl=c.getContext("webgl",o)||c.getContext("experimental-webgl",o);
    if(!gl)return"lite";
    var info=gl.getExtension("WEBGL_debug_renderer_info");
    var r=info?String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)):"";
    var lose=gl.getExtension("WEBGL_lose_context");
    if(lose)lose.loseContext();
    if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r))return"lite";
    return"full";
  }catch(e){return"full"}
}
var tier="full";
try{
  var q=new URLSearchParams(location.search).get("motion");
  if(q==="lite"||q==="full")localStorage.setItem(K+"-override",q);
  else if(q==="auto")localStorage.removeItem(K+"-override");
  var o=localStorage.getItem(K+"-override");
  if(o==="lite"||o==="full")tier=o;
  else{
    var s=sessionStorage.getItem(K);
    if(s==="lite"||s==="full")tier=s;
    else{tier=detect();sessionStorage.setItem(K,tier)}
  }
}catch(e){tier=detect()}
document.documentElement.setAttribute("${MOTION_TIER_ATTRIBUTE}",tier);
})()`

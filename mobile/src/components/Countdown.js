import React,{useEffect,useMemo,useState} from 'react';
import {Text} from 'react-native';

export default function Countdown({target,style}) {
  const [left,setLeft]=useState(Math.max(0,new Date(target).getTime()-Date.now()));
  useEffect(()=>{
    const id=setInterval(()=>setLeft(Math.max(0,new Date(target).getTime()-Date.now())),1000);
    return ()=>clearInterval(id);
  },[target]);
  const p=useMemo(()=>{
    let s=Math.floor(left/1000);
    const d=Math.floor(s/86400); s%=86400;
    const h=Math.floor(s/3600); s%=3600;
    const m=Math.floor(s/60); s%=60;
    return [d,h,m,s].map(x=>String(x).padStart(2,'0'));
  },[left]);
  return <Text style={style}>{p[0]}d : {p[1]}h : {p[2]}m : {p[3]}s</Text>;
}

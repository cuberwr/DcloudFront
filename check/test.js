/* const a = {b: {c: {d:3}}};

function deleteProp(obj, prop) {
  // 注意 obj 是引用类型，如果不想有副作用，需要对obj进行深拷贝
  if (!Array.isArray(prop)) {
    prop = prop.split('.')
  }

  let temp = obj;
  for (let i = 0, len = prop.length; i < len; i++) {
    if (i === len - 1) {
      // 到头了
      // delete 不会报错，所以这一步无论删除成功与否都不会有反馈。如果需要确定是否删除成功了，需要自己判断
      console.log(prop[i])
      console.log(temp)
      
      delete temp[prop[i]];
      break;
    }
    if (temp[prop[i]]) {
      // 这里最好再做个判断，判断temp[key]对应的值是不是对象或者数组
      temp = temp[prop[i]];
    }
  }
  return obj;
}

console.log(a);
deleteProp(a, 'b.c.d');
// deleteProp(a, ['b', 'c']);
console.log(a);


 */

let aa={
    bb:{
        cc:{
            dd:1
        }
    }
}

//let ee=aa
let ee=aa.bb.cc
delete ee.dd

console.log(aa,ee)

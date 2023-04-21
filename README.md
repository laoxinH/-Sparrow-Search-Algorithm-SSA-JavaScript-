# -Sparrow-Search-Algorithm-SSA-JavaScript-

麻雀搜索算法(Sparrow Search Algorithm, SSA) ，采用JS语言实现

测试函数(该函数在0点取得最小值,最小值为0)

```
function fu(x) {
    let a = 20
    let b = 0.2
    let c = 2 * Math.PI
    let s1 = 0
    let s2 = 0
    let result = 0;
    for (let i = 0; i < x.length; i++) {
        s1 += x[i] ** 2
        s2 += Math.cos(c * x[i])
    }
    s1 = -a * Math.exp(-b * Math.sqrt(s1 / x.length));
    s2 = -Math.exp(s2 / x.length)
    result = s1 + s2 + a + Math.exp(1)
    return result
}
```

迭代折线图

![](https://github.com/laoxinH/-Sparrow-Search-Algorithm-SSA-JavaScript-/blob/main/image.png?raw=true)

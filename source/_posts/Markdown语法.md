---
title: "Markdown语法"
date: 2022-12-04T12:20:02.000Z
updated: 2023-01-03T07:09:13.887Z
author: "xuaner"
categories:
  - ["实用工具"]
tags:
  - "实用工具"
  - "Markdown"
---

<h2 id="标题">标题</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="section"># 一级标题</span></span><br><span class="line"><span class="section">## 二级标题</span></span><br><span class="line"><span class="section">### 三级标题</span></span><br></pre></td></tr></table></figure>

<h2 id="列表">列表</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="bullet">+</span> 无序列表1</span><br><span class="line"><span class="bullet">+</span> 无序列表2</span><br><span class="line"><span class="bullet">-</span> 无序列表3</span><br><span class="line"><span class="bullet">-</span> 无序列表4</span><br><span class="line"><span class="bullet">*</span> 无序列表5</span><br><span class="line"><span class="bullet">*</span> 无序列表6</span><br></pre></td></tr></table></figure>

<figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="bullet">1.</span> 有序列表1</span><br><span class="line"><span class="bullet">2.</span> 有序列表2</span><br></pre></td></tr></table></figure>

<figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="bullet">*</span> [ ] 任务列表1</span><br><span class="line"><span class="bullet">*</span> [ ] 任务列表2</span><br><span class="line"><span class="bullet">*</span> [ ] 任务列表3</span><br></pre></td></tr></table></figure>

<h2 id="块">块</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="code">``` 代码块```</span></span><br><span class="line"><span class="code">`标记块`</span></span><br><span class="line"></span><br><span class="line"><span class="quote">&gt; 引述</span></span><br><span class="line"></span><br><span class="line"></span><br></pre></td></tr></table></figure>

<h2 id="超链接">超链接</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br></pre></td><td class="code"><pre><span class="line">![<span class="string">可选</span>](<span class="link">url</span>) 图片超链接</span><br></pre></td></tr></table></figure>

<h2 id="上下标">上下标</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br></pre></td><td class="code"><pre><span class="line">直接写在内容中,只取``中间内容</span><br><span class="line">hexo中建议使用这种</span><br><span class="line">下标:<span class="code">`$a_2$`</span> </span><br><span class="line">上标:<span class="code">`$a^2$`</span></span><br><span class="line"></span><br><span class="line">html格式,需要转义</span><br><span class="line">下标：a<span class="language-xml"><span class="tag">&lt;<span class="name">sub</span>&gt;</span></span>2<span class="language-xml"><span class="tag">&lt;/<span class="name">sub</span>&gt;</span></span></span><br><span class="line">上标：a<span class="language-xml"><span class="tag">&lt;<span class="name">sup</span>&gt;</span></span>2<span class="language-xml"><span class="tag">&lt;/<span class="name">sup</span>&gt;</span></span></span><br><span class="line"></span><br><span class="line">Markdown自带,推荐</span><br><span class="line">下标 ：θ~1~ </span><br><span class="line">上标 ：θ^2^</span><br></pre></td></tr></table></figure>

<h2 id="表格">表格</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br></pre></td><td class="code"><pre><span class="line">| 符号 |       功能       |</span><br><span class="line">| :----: | :----------------: |</span><br><span class="line">|  *  |    零次或多次    |</span><br><span class="line">|  +  |    一次或多次    |</span><br><span class="line">|  ？  |    零次或一次    |</span><br><span class="line">|  ^  |  匹配字符串开头  |</span><br><span class="line">|  $  |  匹配字符串结尾  |</span><br><span class="line">|  \s  |     表示空格     |</span><br><span class="line">|  .  | 匹配任意一个字符 |</span><br><span class="line">|  \w  |   匹配一个字符   |</span><br><span class="line">|  \d  |   匹配一个数字   |</span><br></pre></td></tr></table></figure>

<h2 id="数学公式">数学公式</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">$$</span><br><span class="line">中间写公式</span><br><span class="line">$$</span><br></pre></td></tr></table></figure>

<h2 id="四则运算">四则运算</h2><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line">&#123;&#125; 复合标</span><br><span class="line">t_ &#123;a0&#125;</span><br><span class="line">\frac&#123;分子&#125;&#123;分母&#125; 分式表达</span><br></pre></td></tr></table></figure>

<h1 id="Emoji表情">Emoji表情</h1><figure class="highlight markdown"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="code">`:中间填入对应的字符:`</span></span><br><span class="line"><span class="code">`:sneezing_face:`</span></span><br><span class="line">:sneezing<span class="emphasis">_face:</span></span><br></pre></td></tr></table></figure>

<p>🤧</p>
<p>或者使用<code>win + .</code>调出<code>emoji</code>表情</p>
<table>
<thead>
<tr>
<th align="center">表情</th>
<th align="center">代码</th>
<th align="center">表情</th>
<th align="center">代码</th>
<th align="center">表情</th>
<th align="center">代码</th>
</tr>
</thead>
<tbody><tr>
<td align="center">🤧</td>
<td align="center"><code>:sneezing_face:</code></td>
<td align="center">🤶</td>
<td align="center"><code>:mrs_claus:</code></td>
<td align="center">🍈</td>
<td align="center"><code>:melon:</code></td>
</tr>
<tr>
<td align="center">😠</td>
<td align="center"><code>:angry:</code></td>
<td align="center">🤓</td>
<td align="center"><code>:nerd_face:</code></td>
<td align="center">🥝</td>
<td align="center"><code>:kiwi_fruit:</code></td>
</tr>
<tr>
<td align="center">👼</td>
<td align="center"><code>:angle:</code></td>
<td align="center">😣</td>
<td align="center"><code>:persevere:</code></td>
<td align="center">🌶</td>
<td align="center"><code>:hot_pepper:</code></td>
</tr>
<tr>
<td align="center">😧</td>
<td align="center"><code>:anguished:</code></td>
<td align="center">👿</td>
<td align="center"><code>:imp:</code></td>
<td align="center">🌭</td>
<td align="center"><code>:sneezing_face:</code></td>
</tr>
<tr>
<td align="center">😲</td>
<td align="center"><code>:astonished:</code></td>
<td align="center">🎃</td>
<td align="center"><code>:ack_o_lantern:</code></td>
<td align="center">🍔</td>
<td align="center"><code>:hamburger:</code></td>
</tr>
<tr>
<td align="center">🤢</td>
<td align="center"><code>:nauseated_face:</code></td>
<td align="center">🍅</td>
<td align="center"><code>:tomato:</code></td>
<td align="center">🍩</td>
<td align="center"><code>:doughnut:</code></td>
</tr>
<tr>
<td align="center">🤠</td>
<td align="center"><code>:cowboy_hat_face:</code></td>
<td align="center">🍊</td>
<td align="center"><code>:tangerin:</code></td>
<td align="center">🥕</td>
<td align="center"><code>:carrot:</code></td>
</tr>
<tr>
<td align="center">😵</td>
<td align="center"><code>:dizzy_face:</code></td>
<td align="center">🍍</td>
<td align="center"><code>:pineapple:</code></td>
<td align="center">🍌</td>
<td align="center"><code>:banana:</code></td>
</tr>
<tr>
<td align="center">😁</td>
<td align="center"><code>:grin:</code></td>
<td align="center">🍑</td>
<td align="center"><code>:peach:</code></td>
<td align="center">🥑</td>
<td align="center"><code>:avocado:</code></td>
</tr>
<tr>
<td align="center">😷</td>
<td align="center"><code>:mask:</code></td>
<td align="center">🍋</td>
<td align="center"><code>:lemon:</code></td>
<td align="center">💩</td>
<td align="center"><code>:poop:</code></td>
</tr>
<tr>
<td align="center">🐴</td>
<td align="center"><code>:horse:</code></td>
<td align="center">🎠</td>
<td align="center"><code>:carousel_horse:</code></td>
<td align="center">🐼</td>
<td align="center"><code>:panda_face:</code></td>
</tr>
<tr>
<td align="center">🐎</td>
<td align="center"><code>:racehorse:</code></td>
<td align="center">🦄</td>
<td align="center"><code>:unicorn:</code></td>
<td align="center">🐵</td>
<td align="center"><code>:sneezing_face:</code></td>
</tr>
<tr>
<td align="center">🏇</td>
<td align="center"><code>:horse_racing:</code></td>
<td align="center">🐷</td>
<td align="center"><code>:pig:</code></td>
<td align="center">🐸</td>
<td align="center"><code>:frog:</code></td>
</tr>
<tr>
<td align="center">🦊</td>
<td align="center"><code>:fox_face:</code></td>
<td align="center">🐉</td>
<td align="center"><code>:dragon:</code></td>
<td align="center">🤡</td>
<td align="center"><code>:clown_face:</code></td>
</tr>
<tr>
<td align="center">🐶</td>
<td align="center"><code>:dog:</code></td>
<td align="center">🐮</td>
<td align="center"><code>:COW:</code></td>
<td align="center">🐔</td>
<td align="center"><code>:chicken:</code></td>
</tr>
</tbody></table>
<p></p>

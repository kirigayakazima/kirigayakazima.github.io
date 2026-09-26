---
title: "Pandas技巧"
date: 2022-12-01T11:21:58.000Z
updated: 2022-12-01T11:39:01.061Z
author: "xuaner"
categories:
  - ["深度学习"]
tags:
  - "pandas"
  - "深度学习"
---

<h2 id="差集">差集</h2><figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">#取df_data1和df_data2的差集，剩下df_data1的余差</span></span><br><span class="line">df_data3=pd.concat([df_data1,df_data2,df_data2]).drop_duplicates(keep=<span class="literal">False</span>)</span><br></pre></td></tr></table></figure>

<h2 id="掩膜">掩膜</h2><figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">#取a列和b列相等的行</span></span><br><span class="line">df_data2=df_data1[df_data1[<span class="string">&#x27;a&#x27;</span>]==df_data1[<span class="string">&#x27;b&#x27;</span>]]</span><br><span class="line"></span><br><span class="line"><span class="comment">#取a列不为null的行</span></span><br><span class="line">df_data2=df_data1[df_data1[<span class="string">&#x27;a&#x27;</span>].notna()]</span><br></pre></td></tr></table></figure>

<h2 id="替换值">替换值</h2><figure class="highlight python"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">#将a列的元素为 （null） 替换为空</span></span><br><span class="line">df_data1.loc[:,<span class="string">&#x27;a&#x27;</span>]=df_data1.loc[:,<span class="string">&#x27;a&#x27;</span>].replace(<span class="string">&#x27;(null)&#x27;</span>,np.nan)</span><br></pre></td></tr></table></figure>

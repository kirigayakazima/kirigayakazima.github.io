---
title: "FreeRTOS-06-软件定时器"
date: 2023-07-05T08:03:07.000Z
updated: 2023-07-05T08:03:44.357Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="软件定时器">软件定时器</h2><p>软件定时器是一种基于硬件定时器的资源利用手段，相当于扩展了定时器数量。</p>
<ol>
<li>允许开启关闭软件定时</li>
<li>创建软件定时</li>
<li>启动软件定时</li>
<li>停止软件定时</li>
<li>复位软件定时</li>
<li>删除软件定时</li>
</ol>
<h3 id="软件定时运行机制">软件定时运行机制</h3><figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//开启宏定义</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_TIMERS 1</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configTIMER_QUEUE_LENGTH		        10 </span></span><br></pre></td></tr></table></figure>

<ol>
<li>单次模式，定时完毕只执行一次回调</li>
<li>周期模式，定时完毕周期性执行回调</li>
</ol>
<p><img src="/images/BlogImg/202307050926299.png"></p>
<p></p>
<ol start="3">
<li><p>软件定时精度不如硬件定时，且容易被打断，用于一些辅助性任务</p>
</li>
<li><p>软件定时通信采用队列消息</p>
</li>
</ol>
<p> <img src="/images/BlogImg/202307050941956.png"></p>
<ol start="5">
<li>软件回调应该快进快出，不能有阻塞行为，不允许死循环</li>
</ol>
<h3 id="定时器常见函数">定时器常见函数</h3><ol>
<li><code>xTimerCreate()</code>创建一个定时器，返回句柄</li>
<li><code>xTimerStart()</code>启动定时器</li>
<li><code>xTimerStartFromISR()</code>中断启动定时器</li>
<li><code>xTimerStop()</code>停止定时器</li>
<li><code>xTimerStopFromISR()</code>中断停止定时器</li>
<li><code>xTimerDelete()</code>删除定时器</li>
</ol>
<h3 id="创建定时器">创建定时器</h3><p>创建2个定时器回调任务，其中一个周期1s定时任务，另一个5s单次任务</p>
<blockquote>
<p>开启宏定义</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//中断事件组</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_TIMERS 1</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> INCLUDE_xTimerPendFunctionCall 0</span></span><br><span class="line"><span class="comment">//软件定时器队列长度</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configTIMER_QUEUE_LENGTH		        10  </span></span><br><span class="line"><span class="comment">//软件定时器优先级</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configTIMER_TASK_PRIORITY (configMAX_PRIORITIES-1)</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>定时器句柄，创建一个引用，并不是创建一个真实的定时器</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//软件定时器句柄</span></span><br><span class="line"><span class="type">static</span> TimerHandle_t Swtmr1_Handle=<span class="literal">NULL</span>;</span><br><span class="line"><span class="type">static</span> TimerHandle_t Swtmr2_Handle=<span class="literal">NULL</span>;</span><br><span class="line"></span><br><span class="line"><span class="type">static</span> <span class="type">uint32_t</span> TmrCb_Count1=<span class="number">0</span>;		<span class="comment">//记录定时器1回调函数执行次数</span></span><br><span class="line"><span class="type">static</span> <span class="type">uint32_t</span> TmrCb_Count2=<span class="number">0</span>;		<span class="comment">//记录定时器2回调函数执行次数</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建真实的定时器1</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//定时器句柄</span></span><br><span class="line">	Swtmr1_Handle = xTimerCreate(</span><br><span class="line">		(<span class="type">const</span> <span class="type">char</span>*)<span class="string">&quot;AutoReloadTimer&quot;</span>,		<span class="comment">//定时器名称</span></span><br><span class="line">		<span class="number">1000</span>,					<span class="comment">//定时器周期</span></span><br><span class="line">		pdTRUE,					<span class="comment">//周期模式</span></span><br><span class="line">		(<span class="type">void</span> *)<span class="number">1</span>,				<span class="comment">//为每个计时器分配索引唯一ID</span></span><br><span class="line">		Swtmr1_Callback);			<span class="comment">//回调函数</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建真实的定时器2</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//定时器句柄</span></span><br><span class="line">	Swtmr2_Handle = xTimerCreate(</span><br><span class="line">		(<span class="type">const</span> <span class="type">char</span>*)<span class="string">&quot;OneShotTimer&quot;</span>,		<span class="comment">//定时器名称</span></span><br><span class="line">		<span class="number">5000</span>,					<span class="comment">//定时器周期</span></span><br><span class="line">		pdFALSE,				<span class="comment">//周期模式</span></span><br><span class="line">		(<span class="type">void</span> *)<span class="number">2</span>,				<span class="comment">//为每个计时器分配索引唯一ID</span></span><br><span class="line">		Swtmr2_Callback);			<span class="comment">//回调函数</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>定时器1回调函数</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Swtmr1_Callback</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	TickType_t tick_num1;</span><br><span class="line">	TmrCb_Count1++;		<span class="comment">//每次回调自加1</span></span><br><span class="line"></span><br><span class="line">	tick_num1=xTaskGetTickCount();		<span class="comment">//获取滴答计时器计数值</span></span><br><span class="line"></span><br><span class="line">	LED0_Turn();</span><br><span class="line">	<span class="built_in">printf</span>(<span class="string">&quot;swtmr1_callback回调函数执行次数%d\r\n&quot;</span>,TmrCb_Count1);</span><br><span class="line">	<span class="built_in">printf</span>(<span class="string">&quot;滴答计时器计数值%d\r\n&quot;</span>,tick_num1);</span><br><span class="line"></span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>定时器2回调函数</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Swtmr2_Callback</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	TickType_t tick_num2;</span><br><span class="line">	TmrCb_Count2++;		<span class="comment">//每次回调自加1</span></span><br><span class="line"></span><br><span class="line">	tick_num2=xTaskGetTickCount();		<span class="comment">//获取滴答计时器计数值</span></span><br><span class="line"></span><br><span class="line">	<span class="comment">// LED0_Turn();</span></span><br><span class="line">	<span class="built_in">printf</span>(<span class="string">&quot;swtmr2_callback回调函数执行次数%d\r\n&quot;</span>,TmrCb_Count2);</span><br><span class="line">	<span class="built_in">printf</span>(<span class="string">&quot;滴答计时器计数值%d\r\n&quot;</span>,tick_num2);</span><br><span class="line"></span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>每过1s，定时器1运行一次，第5s，定时器2运行一次</p>
</blockquote>
<p></p>

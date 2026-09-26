---
title: "FreeRTOS-05-事件"
date: 2023-07-04T13:53:11.000Z
updated: 2023-07-04T13:53:32.949Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="事件">事件</h2><p>事件是一种任务间通信的技术，和信号量不同，可以实现一对多，多对多的通信，但是不涉及数据的传输。</p>
<ol>
<li><code>configUSE_16_BIT_TICKS</code> 开启后，<code>uxEventBits</code>为16位，8位存储事件组；未开启时，<code>uxEventBits</code>为32位，24位存储事件组。</li>
<li>事件只与任务相关联，事件之间彼此独立。</li>
<li>事件只同于同步，不涉及数据传输。</li>
<li>事件无队列消息性质，多次向同一任务发送事件，若未被读取，则视为一次事件。</li>
<li>支持事件等待超时机制。</li>
</ol>
<h3 id="事件运行机制">事件运行机制</h3><figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//中断事件组</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_TIMERS 0</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> INCLUDE_xTimerPendFunctionCall 0</span></span><br><span class="line"><span class="comment">//软件定时器优先级</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configTIMER_TASK_PRIORITY (configMAX_PRIORITIES-1)</span></span><br></pre></td></tr></table></figure>

<ol>
<li>事件接收成功后，需要使用<code>xClearOnExit()</code>来清除事件类型，否则不会清除已接收的事件，需要手动显示清除。</li>
<li>24位存储事件中，<code>1</code>表示事件已发生，<code>0</code>表示事件未发生</li>
</ol>
<p><img src="/images/BlogImg/202307041712672.png"></p>
<ol start="3">
<li>任务唤醒遵循事件的或与逻辑</li>
</ol>
<p><img src="/images/BlogImg/202307041721868.png"></p>
<h3 id="事件常见函数">事件常见函数</h3><ol>
<li><code>xEventGroupCreate()</code>创建事件组，返回一个句柄</li>
<li><code>xEventGroupDelete()</code>删除事件</li>
<li><code>xEventGroupSetBits()</code>置位事件组中指定的位，置位后，阻塞该位的任务会被解锁。</li>
<li><code>xEventGroupSetBitsFromISR()</code>中断置位事件组，需要开启<code>configUSE_TIMERS 1</code>和<code>INCLUDE_xTimerPendFunctionCall 1</code>宏定义</li>
<li><code>xEventGroupWaitBits()</code>等待事件，获取事件标志位。</li>
<li><code>xEventGroupClearBits()</code>清除事件组置位</li>
<li><code>xEventGroupClearBitsFromISR()</code>中断清除事件组置位</li>
</ol>
<h3 id="创建事件">创建事件</h3><p>创建2个<code>Btn</code>任务控制<code>LED</code>任务，当只按下<code>BTN1</code>时，不亮，接着按下<code>BTN2</code>后，亮。此时相当于标志位变得和设定相同。</p>
<blockquote>
<p>开启宏定义</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//中断事件组</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configUSE_TIMERS 0</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> INCLUDE_xTimerPendFunctionCall 0</span></span><br><span class="line"><span class="comment">//软件定时器优先级</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configTIMER_TASK_PRIORITY (configMAX_PRIORITIES-1)</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>事件句柄，创建一个引用，并不是创建一个真实的事件</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//事件句柄</span></span><br><span class="line"><span class="type">static</span> EventGroupHandle_t Event_Handle=<span class="literal">NULL</span>;</span><br><span class="line"></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> KEY1_EVENT (0x01 &lt;&lt; 0)		<span class="comment">//设置掩码的位0</span></span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> KEY2_EVENT (0x01 &lt;&lt; 1)		<span class="comment">//设置掩码的位1</span></span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的事件</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建事件句柄</span></span><br><span class="line">Event_Handle = xEventGroupCreate();</span><br></pre></td></tr></table></figure>

<blockquote>
<p>LED任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">LED0_Event_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	EventBits_t r_event;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		r_event = xEventGroupWaitBits(</span><br><span class="line">			Event_Handle,				<span class="comment">//事件句柄</span></span><br><span class="line">			KEY1_EVENT | KEY2_EVENT,		<span class="comment">//接收感兴趣事件</span></span><br><span class="line">			pdTRUE,					<span class="comment">//退出时清除事件位</span></span><br><span class="line">			pdTRUE,					<span class="comment">//满足感兴趣的所有事件</span></span><br><span class="line">			portMAX_DELAY);				<span class="comment">//超时一直等待</span></span><br><span class="line"></span><br><span class="line">		<span class="keyword">if</span> (r_event &amp; (KEY1_EVENT | KEY2_EVENT) == (KEY1_EVENT | KEY2_EVENT))</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;KEY1和KEY2都按下\r\n&quot;</span>);</span><br><span class="line">			LED0_Turn();</span><br><span class="line">		&#125;<span class="keyword">else</span></span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;事件错误\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Key任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">KEY_Event_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span>(Key_BTN(BTN1)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;KEY1按下\r\n&quot;</span>);</span><br><span class="line">			xEventGroupSetBits(Event_Handle,KEY1_EVENT);</span><br><span class="line">		&#125;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN2)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;KEY2按下\r\n&quot;</span>);</span><br><span class="line">			xEventGroupSetBits(Event_Handle,KEY2_EVENT);</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line">	&#125;</span><br><span class="line"></span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>当BTN1和BTN2都按下后，才会翻转信号</p>
</blockquote>
<p></p>

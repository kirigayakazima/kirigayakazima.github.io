---
title: "FreeRTOS-03-消息队列"
date: 2023-07-01T02:32:35.000Z
updated: 2023-07-01T02:32:56.899Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="消息队列">消息队列</h2><p>消息队列是一种用于线程间通信的技术，在<code>FreeRTOS</code>中则用于任务间通信，其中的任务可以视为线程。</p>
<p>支持先进先出、后进先出</p>
<h3 id="消息队列运行机制">消息队列运行机制</h3><ol>
<li><p>创建消息队列单独划分一个内存空间，内存大小&#x3D;控制块大小+单个消息空间*队列长度，然后初始化消息队列，空间大小无法更改。</p>
</li>
<li><p>初始化后，内存空间中会包含头指针等信息，消耗部分内存，删除消息队列后空间释放。</p>
</li>
<li><p>每个空间存放不大于<code>uxItemSize</code> 的任意类型数据。</p>
</li>
<li><p>队列未满，消息会被拷贝到队列末尾。紧急消息则发送至队列首。</p>
</li>
<li><p>当有任务请求队列消息时，任务变为阻塞态在等待时间内等待消息，若消息空间内无消息直至超时，则任务变为就绪态，否则接收消息变为就绪态。</p>
</li>
<li><p>消息队列不再使用后，应该及时删除，释放资源。</p>
</li>
<li><p>任务等待消息的几种状态</p>
<ol>
<li><p>即刻型：任务等待消息，若队列中没有消息，任务直接变为就绪态，不再等待消息。</p>
</li>
<li><p>等待型：任务变为阻塞态，在等待时间内等待队列消息，若有消息则接收并变为就绪态，若无就超时变为就绪态。</p>
</li>
<li><p>无限型：任务一直等待消息，直到消息出现。</p>
</li>
</ol>
<ul>
<li>注意事项：<strong>只有任务才能进入阻塞态，中断不能进入阻塞态，中断有单独的消息函数</strong></li>
</ul>
</li>
</ol>
<p><img src="/images/BlogImg/202306301510943.png"></p>
<h3 id="队列常见函数">队列常见函数</h3><ol>
<li><p><code>xQueueCreate()</code>创建一个队列返回一个指针类型的句柄</p>
<ul>
<li>使用的是动态内存，需要开启<code>configSUPPORT_DYNAMIC_ALLOCATION 1</code>宏定义</li>
<li>创建的时候，申请内存是连续的，保证队列控制块和消息空间的连续</li>
</ul>
</li>
<li><p><code>xQueueStaticCreate()</code>使用静态内存创建一个队列</p>
</li>
<li><p><code>vQueueDelete()</code>队列删除</p>
</li>
<li><p><code>xQueueSend()</code>向队列发送消息，以拷贝的形式在队列尾部加入一个消息，不能在中断中使用</p>
</li>
<li><p><code>xQueueSendToBack()</code>和<code>xQueueSend()</code>等效</p>
</li>
<li><p><code>xQueueSendFromISR()</code>用于中断中向队列尾部发送一个消息</p>
</li>
<li><p><code>xQueueSendToBackFromISR()</code>和<code>xQueueSendFromISR()</code>等效</p>
</li>
<li><p><code>xQueueGenericSend()</code>通用消息队列发送，是上述发送的原型</p>
</li>
<li><p><code>xQueueGenericSendFromISR()</code>中断通用消息队列发送，中断发送的原型</p>
</li>
<li><p><code>xQueueReceive()</code>从队列中接收消息，并将消息删除，将消息拷贝至缓冲区</p>
</li>
<li><p><code>xQueuePeek()</code>从队列中接收消息，不删除消息</p>
</li>
<li><p><code>xQueueReceiveFromISR()</code>中断中使用</p>
</li>
<li><p><code>xQueuePeekFromISR()</code>中断中使用</p>
</li>
<li><p><code>xQueueGenericReceive()</code>通用接收消息，上述的原型</p>
</li>
</ol>
<h3 id="创建队列">创建队列</h3><p>设计2个<code>Button</code>任务，通过按键发送不同的<code>Data</code>数据，然后将发送的<code>Data</code>数据在另一个任务中接收，最终在串口显示</p>
<blockquote>
<p>队列消息句柄，创建一个引用，并不是创建一个真实的队列消息，同时设置队列的属性</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个Queue句柄</span></span><br><span class="line">QueueHandle_t Test_Queue=<span class="literal">NULL</span>;</span><br><span class="line"><span class="meta">#<span class="keyword">define</span> QUEUE_LEN 4			<span class="comment">//队列长度</span></span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> QUEUE_SIZE 4		<span class="comment">//单个消息空间大小</span></span></span><br></pre></td></tr></table></figure>

<blockquote>
<p>创建一个真实的队列</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//创建一个Queue队列</span></span><br><span class="line">Test_Queue=xQueueCreate((UBaseType_t)QUEUE_LEN,(UBaseType_t)QUEUE_SIZE);</span><br></pre></td></tr></table></figure>

<blockquote>
<p>接收数据任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Receive_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdTRUE;</span><br><span class="line">	<span class="type">uint32_t</span> r_queue;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="comment">//消息队列句柄，缓冲区，等待时间：一直等待</span></span><br><span class="line">		xReturn = xQueueReceive(Test_Queue,&amp;r_queue,portMAX_DELAY);</span><br><span class="line">		<span class="keyword">if</span>(xReturn==pdTRUE)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;本次接收到的消息是%d\r\n&quot;</span>,r_queue);</span><br><span class="line">		&#125;<span class="keyword">else</span></span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;数据接收错误，错误代码:0x%l\r\n&quot;</span>,xReturn);</span><br><span class="line">		&#125;</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<blockquote>
<p>Button控制发送数据任务</p>
</blockquote>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br><span class="line">23</span><br><span class="line">24</span><br><span class="line">25</span><br><span class="line">26</span><br><span class="line">27</span><br><span class="line">28</span><br><span class="line">29</span><br><span class="line">30</span><br><span class="line">31</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">Send_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	BaseType_t xReturn=pdTRUE;</span><br><span class="line">	<span class="type">uint32_t</span> send_data1=<span class="number">1</span>;</span><br><span class="line">	<span class="type">uint32_t</span> send_data2=<span class="number">2</span>;</span><br><span class="line">	<span class="keyword">while</span> (<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN1)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;发送消息send_data1\r\n&quot;</span>);</span><br><span class="line">			<span class="comment">//消息队列句柄，数据，等待时间：0</span></span><br><span class="line">			xReturn = xQueueSend(Test_Queue,&amp;send_data1,<span class="number">0</span>);</span><br><span class="line"></span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;消息send_data1发送成功\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line"></span><br><span class="line">		<span class="keyword">if</span> (Key_BTN(BTN2)==KEY_ON)</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;发送消息send_data2\r\n&quot;</span>);</span><br><span class="line">			xReturn = xQueueSend(Test_Queue,&amp;send_data2,<span class="number">0</span>);</span><br><span class="line">			<span class="keyword">if</span> (xReturn==pdTRUE)</span><br><span class="line">			&#123;</span><br><span class="line">				<span class="built_in">printf</span>(<span class="string">&quot;消息send_data2发送成功\r\n&quot;</span>);</span><br><span class="line">			&#125;</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<p></p>

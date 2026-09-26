---
title: "FreeRTOS-01-移植"
date: 2023-06-29T06:52:44.000Z
updated: 2023-06-29T06:57:32.061Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="堆和栈">堆和栈</h2><h3 id="堆">堆</h3><h3 id="栈">栈</h3><p>返回地址保存在栈中</p>
<h2 id="添加串口打印功能">添加串口打印功能</h2><ul>
<li><p>去掉无关代码、LCD等</p>
</li>
<li><p>增加串口打印功能</p>
<ul>
<li>初始化串口</li>
<li>实现fputc</li>
</ul>
</li>
</ul>
<h2 id="标准库移植">标准库移植</h2><p>将官方标准库移植到STM32F103C8T6</p>
<h2 id="常见变量类型">常见变量类型</h2><p><code>TaskHandle_t</code>是任务句柄类型，指针类型，原型为<code>void *</code></p>
<p><code>StackType_t</code>是任务堆栈类型，整型类型，原型为<code>uint32_t</code></p>
<p><code>StackTask_t</code>是任务块类型，结构体，原型为<code>xSTATIC_TCB</code>结构体</p>
<h2 id="移植注意事项">移植注意事项</h2><h3 id="FreeRTOSConfig-h">FreeRTOSConfig.h</h3><p>配置中断服务</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">/****************************************************************</span></span><br><span class="line"><span class="comment">            FreeRTOS与中断服务函数有关的配置选项,映射端口                     </span></span><br><span class="line"><span class="comment">****************************************************************/</span></span><br><span class="line"></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> xPortPendSVHandler 	PendSV_Handler</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> vPortSVCHandler 	SVC_Handler</span></span><br></pre></td></tr></table></figure>

<h3 id="Serial-c">Serial.c</h3><p>注意串口波特率一致性</p>
<p>尽量使用<code>printf</code>而不使用自定义<code>Serial_Printf</code></p>
<h3 id="main-c">main.c</h3><p>注意开启<code>vTaskStartScheduler</code></p>
<h2 id="创建任务">创建任务</h2><h3 id="静态SARM内存">静态SARM内存</h3><p>需要开启静态内存</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//支持静态内存</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> configSUPPORT_STATIC_ALLOCATION					1	</span></span><br></pre></td></tr></table></figure>

<p>静态内存任务开启区函数</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br></pre></td><td class="code"><pre><span class="line">LEDTask_Handle = xTaskCreateStatic((TaskFunction_t)LED_Task,	<span class="comment">//任务LED</span></span><br><span class="line">				(<span class="type">const</span> <span class="type">char</span>*)<span class="string">&quot;LED_Task&quot;</span>,	<span class="comment">//任务名</span></span><br><span class="line">				(<span class="type">uint32_t</span>)<span class="number">128</span>,			<span class="comment">//堆栈大小</span></span><br><span class="line">				(<span class="type">void</span>*)<span class="literal">NULL</span>,			<span class="comment">//传给函数的参数</span></span><br><span class="line">				(UBaseType_t)<span class="number">4</span>,			<span class="comment">//任务优先级</span></span><br><span class="line">				(StackType_t *)LED_Task_Stack,	<span class="comment">//任务堆栈</span></span><br><span class="line">				(StaticTask_t *)&amp;LED_Task_TCB);	<span class="comment">//任务控制块</span></span><br></pre></td></tr></table></figure>

<h3 id="动态SARM内存">动态SARM内存</h3><p>不开启静态内存</p>
<p>动态内存任务开启函数</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br></pre></td><td class="code"><pre><span class="line">xReturn = xTaskCreate((TaskFunction_t)LED_Task,		<span class="comment">//任务LED</span></span><br><span class="line">			(<span class="type">const</span> <span class="type">char</span>*)<span class="string">&quot;LED_Task&quot;</span>,	<span class="comment">//任务名</span></span><br><span class="line">			(<span class="type">uint16_t</span>)<span class="number">512</span>,			<span class="comment">//堆栈大小</span></span><br><span class="line">			(<span class="type">void</span>*)<span class="literal">NULL</span>,			<span class="comment">//传给函数的参数</span></span><br><span class="line">			(UBaseType_t)<span class="number">2</span>,			<span class="comment">//任务优先级</span></span><br><span class="line">			(TaskHandle_t *)&amp;LEDTask_Handle);<span class="comment">//任务控制块指针</span></span><br></pre></td></tr></table></figure>

<blockquote>
<p><strong>注意</strong>动态和静态的开启函数区别，参数不同，参数类型也不同。</p>
</blockquote>
<h3 id="多任务">多任务</h3><p>多任务相较于单任务，区别只在任务开启的个数，对应参数填好，开启任务即可实现多任务。</p>
<p></p>

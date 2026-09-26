---
title: "FreeRTOS-02-任务管理"
date: 2023-06-30T02:23:38.000Z
updated: 2023-06-30T02:26:10.123Z
author: "xuaner"
categories:
  - ["单片机"]
tags:
  - "STM32"
---

<h2 id="任务管理">任务管理</h2><h3 id="系统中任务运行调度方式">系统中任务运行调度方式</h3><ol>
<li><p>每个任务都是在<strong>独立</strong>的堆栈环境运行，运行的任务越多需要的堆栈空间越多。</p>
</li>
<li><p>任务之间的切换是基于抢占优先级的，高优先级抢占低优先级</p>
</li>
<li><p>任务切换的寻找方式</p>
<ul>
<li>基于链表，从高往低查，任务创建时已经完成排序</li>
<li>计算前导零指令<code>CLZ</code>，直接读出优先级任务(<code>stm32</code>使用这种方式)</li>
</ul>
</li>
<li><p>相同优先级任务则采用时间片轮转，无更高优先级任务情况下。</p>
</li>
</ol>
<h3 id="任务状态">任务状态</h3><p>创建的任务一般有四种状态</p>
<ol>
<li><p>就绪态：新创建的任务处于该状态，等待调度器调度</p>
</li>
<li><p>运行态：正在运行的任务，运行的是最高优先级的就绪态任务</p>
</li>
<li><p>阻塞态：不在就绪态列表中，处于中断或等待</p>
</li>
<li><p>挂起态：</p>
<ul>
<li>挂起态任务调度器不可见</li>
<li>使用<code>vTaskSuspend()</code>进入挂起态</li>
<li>使用<code>vTaskResume()</code>或<code>vTaskResumeFromISR()</code>从挂起态恢复</li>
<li>和阻塞态的区别在于：挂起态用于长时间不处理的任务；阻塞态的任务系统需要判断是否<code>超时</code></li>
</ul>
</li>
</ol>
<h3 id="常见任务操作函数">常见任务操作函数</h3><ol>
<li><p><code>vTaskSuspend()</code>任务挂起：等效于该任务被“冻结”或者“休眠”</p>
</li>
<li><p><code>vTaskSuspendAll()</code>全任务挂起</p>
</li>
<li><p><code>vTaskResume()</code>任务恢复：将被挂起的任务恢复</p>
</li>
<li><p><code>vTaskResumeFromISR()</code>中断专用任务恢复</p>
<ul>
<li>无论使用几次<code>vTaskSuspend()</code>，只需要使用一次恢复函数即可恢复</li>
<li>需要配置<code>INCLUDE_vTaskResumeFromISR 1</code>的宏定义</li>
</ul>
</li>
<li><p><code>vTaskResumeAll()</code>全任务恢复</p>
</li>
<li><p><code>vTaskDelete()</code>任务删除</p>
</li>
<li><p><code>vTaskDelay()</code>任务延时，延时时间为<code>Systick</code></p>
</li>
<li><p><code>vTaskDelayUntil()</code>任务绝对延时</p>
</li>
</ol>
<h3 id="设计一个任务管理">设计一个任务管理</h3><p>通过2个<code>Button</code>控制一个<code>LED</code>灯任务的挂起和恢复，需要注意的是：按键检测最好设计成通用函数，保留<code>GPIO</code>和<code>Pin</code>让每个按键的检测尽量避免耦合</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br></pre></td><td class="code"><pre><span class="line"><span class="comment">//按下状态,0为低有效道通,此处根据接线而定</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> KEY_ON 0</span></span><br><span class="line"><span class="meta">#<span class="keyword">define</span> KEY_OFF 1</span></span><br><span class="line"></span><br><span class="line"><span class="type">uint8_t</span> <span class="title function_">Key_Scan</span><span class="params">(GPIO_TypeDef* GPIOx,<span class="type">uint16_t</span> GPIO_Pin)</span></span><br><span class="line">&#123;	</span><br><span class="line">	<span class="comment">/*检测是否有按键按下 */</span></span><br><span class="line">	<span class="keyword">if</span>(GPIO_ReadInputDataBit(GPIOx,GPIO_Pin) == KEY_ON  )  </span><br><span class="line">	&#123;	 </span><br><span class="line">		<span class="comment">/*等待按键释放 */</span></span><br><span class="line">		<span class="keyword">while</span>(GPIO_ReadInputDataBit(GPIOx,GPIO_Pin) == KEY_ON );   </span><br><span class="line">		<span class="keyword">return</span> 	KEY_ON ;	 </span><br><span class="line">	&#125;</span><br><span class="line">	<span class="keyword">else</span></span><br><span class="line">		<span class="keyword">return</span> KEY_OFF;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<p>建立一个按键检测的任务，根据按键检测来判断是否导通，然后其中一个按键用于挂起任务，另一个按键用于恢复任务。</p>
<figure class="highlight c"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span><br><span class="line">4</span><br><span class="line">5</span><br><span class="line">6</span><br><span class="line">7</span><br><span class="line">8</span><br><span class="line">9</span><br><span class="line">10</span><br><span class="line">11</span><br><span class="line">12</span><br><span class="line">13</span><br><span class="line">14</span><br><span class="line">15</span><br><span class="line">16</span><br><span class="line">17</span><br><span class="line">18</span><br><span class="line">19</span><br><span class="line">20</span><br><span class="line">21</span><br><span class="line">22</span><br></pre></td><td class="code"><pre><span class="line"><span class="type">static</span> <span class="type">void</span> <span class="title function_">KEY_Task</span><span class="params">(<span class="type">void</span> *paramter)</span></span><br><span class="line">&#123;</span><br><span class="line">	<span class="keyword">while</span>(<span class="number">1</span>)</span><br><span class="line">	&#123;</span><br><span class="line">		<span class="keyword">if</span>( Key_Scan(GPIOB,GPIO_Pin_1) == <span class="number">0</span> )</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">/* Button1 被按下 */</span></span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;按下开启键，LED0任务挂起\r\n&quot;</span>);</span><br><span class="line">			vTaskSuspend(LED0_Task_Handle);<span class="comment">/* 挂起LED任务 */</span></span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;挂起成功\r\n&quot;</span>);</span><br><span class="line">		&#125; </span><br><span class="line">		<span class="keyword">if</span>( Key_Scan(GPIOB,GPIO_Pin_10) == <span class="number">0</span>  )</span><br><span class="line">		&#123;</span><br><span class="line">			<span class="comment">/* Button1 被按下 */</span></span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;按下关闭键，LED0任务恢复\r\n&quot;</span>);</span><br><span class="line">			vTaskResume(LED0_Task_Handle);<span class="comment">/* 恢复LED任务！ */</span></span><br><span class="line">			<span class="built_in">printf</span>(<span class="string">&quot;恢复成功\r\n&quot;</span>);</span><br><span class="line">		&#125;</span><br><span class="line">		vTaskDelay(<span class="number">20</span>);</span><br><span class="line"></span><br><span class="line">	&#125;</span><br><span class="line">&#125;</span><br></pre></td></tr></table></figure>

<p></p>
<p></p>
